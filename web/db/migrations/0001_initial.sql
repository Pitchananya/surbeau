-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Sur Beau — Initial Schema (Neon Postgres)                                ║
-- ║                                                                          ║
-- ║ Run this in Neon Console → SQL Editor (or `drizzle-kit push`).           ║
-- ║                                                                          ║
-- ║ No RLS — authorization is enforced in app layer (Server Actions /        ║
-- ║ Route Handlers) using Auth.js session role + status checks.              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create extension if not exists "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('admin', 'sale', 'clinic', 'customer');
exception when duplicate_object then null; end $$;
do $$ begin
  create type user_status as enum ('active', 'pending', 'blocked');
exception when duplicate_object then null; end $$;
do $$ begin
  create type sale_status as enum ('pending', 'approved', 'rejected', 'blocked');
exception when duplicate_object then null; end $$;
do $$ begin
  create type clinic_status as enum ('pending', 'approved', 'rejected', 'blocked');
exception when duplicate_object then null; end $$;
do $$ begin
  create type subscription_tier as enum ('free', 'verified', 'premier');
exception when duplicate_object then null; end $$;
do $$ begin
  create type lead_status as enum ('new', 'contacted', 'success', 'failed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type commission_status as enum ('pending', 'approved', 'awaiting_payout', 'paid', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payout_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ── users ─────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique,
  name          text not null,
  phone         text,
  image         text,
  role          user_role not null default 'customer',
  status        user_status not null default 'active',
  line_user_id  text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists users_role_status_idx on public.users(role, status);

-- ── sale_profiles ─────────────────────────────────────────────────────────
create table if not exists public.sale_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references public.users(id) on delete cascade,
  bio               text,
  bank_account_name text,
  bank_account_no   text,
  bank_name         text,
  promptpay         text,
  status            sale_status not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists sale_profiles_status_idx on public.sale_profiles(status);

-- ── clinic_profiles ───────────────────────────────────────────────────────
create table if not exists public.clinic_profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references public.users(id) on delete cascade,
  clinic_name        text not null,
  license_no         text,
  address            text,
  province           text,
  district           text,
  latitude           numeric(10, 7),
  longitude          numeric(10, 7),
  phone              text,
  line_official      text,
  facebook_url       text,
  instagram_url      text,
  subscription_tier  subscription_tier not null default 'free',
  rating_avg         numeric(3, 2) not null default 0,
  rating_count       integer not null default 0,
  status             clinic_status not null default 'pending',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists clinic_profiles_status_tier_idx on public.clinic_profiles(status, subscription_tier);
create index if not exists clinic_profiles_province_idx on public.clinic_profiles(province);
create index if not exists clinic_profiles_geo_idx on public.clinic_profiles(latitude, longitude);

-- ── campaigns ─────────────────────────────────────────────────────────────
create table if not exists public.campaigns (
  id                      uuid primary key default gen_random_uuid(),
  clinic_id               uuid not null references public.clinic_profiles(id) on delete cascade,
  title                   text not null,
  description             text,
  normal_price            numeric(12, 2),
  promo_price             numeric(12, 2),
  commission_per_success  numeric(12, 2) not null check (commission_per_success >= 0),
  max_slots               integer,
  start_date              date,
  end_date                date,
  is_active               boolean not null default true,
  is_featured             boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index if not exists campaigns_active_idx on public.campaigns(is_active, is_featured);
create index if not exists campaigns_clinic_idx on public.campaigns(clinic_id);

-- ── leads ─────────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id                 uuid primary key default gen_random_uuid(),
  campaign_id        uuid not null references public.campaigns(id) on delete cascade,
  sale_id            uuid not null references public.sale_profiles(id) on delete restrict,
  customer_name      text not null,
  customer_phone     text not null,
  note               text,
  status             lead_status not null default 'new',
  status_updated_at  timestamptz,
  status_updated_by  uuid references public.users(id),
  created_at         timestamptz not null default now()
);
create index if not exists leads_campaign_status_idx on public.leads(campaign_id, status);
create index if not exists leads_sale_status_idx on public.leads(sale_id, status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);

-- ── commissions ───────────────────────────────────────────────────────────
create table if not exists public.commissions (
  id           uuid primary key default gen_random_uuid(),
  sale_id      uuid not null references public.sale_profiles(id) on delete restrict,
  lead_id      uuid not null unique references public.leads(id) on delete cascade,
  amount       numeric(12, 2) not null check (amount >= 0),
  status       commission_status not null default 'pending',
  approved_at  timestamptz,
  approved_by  uuid references public.users(id),
  paid_at      timestamptz,
  paid_by      uuid references public.users(id),
  created_at   timestamptz not null default now()
);
create index if not exists commissions_sale_status_idx on public.commissions(sale_id, status);

-- ── payout_requests ───────────────────────────────────────────────────────
create table if not exists public.payout_requests (
  id                 uuid primary key default gen_random_uuid(),
  sale_id            uuid not null references public.sale_profiles(id) on delete restrict,
  amount             numeric(12, 2) not null check (amount > 0),
  bank_account_name  text,
  bank_account_no    text,
  bank_name          text,
  promptpay          text,
  note               text,
  status             payout_status not null default 'pending',
  processed_at       timestamptz,
  processed_by       uuid references public.users(id),
  created_at         timestamptz not null default now()
);
create index if not exists payout_requests_sale_status_idx on public.payout_requests(sale_id, status);
create unique index if not exists payout_one_pending_per_sale
  on public.payout_requests(sale_id) where status = 'pending';

-- ── clinic_reviews ────────────────────────────────────────────────────────
create table if not exists public.clinic_reviews (
  id             uuid primary key default gen_random_uuid(),
  clinic_id      uuid not null references public.clinic_profiles(id) on delete cascade,
  lead_id        uuid unique references public.leads(id) on delete set null,
  reviewer_name  text not null,
  rating         smallint not null check (rating between 1 and 5),
  comment        text,
  is_verified    boolean not null default false,
  is_visible     boolean not null default true,
  created_at     timestamptz not null default now()
);
create index if not exists clinic_reviews_clinic_visible_idx on public.clinic_reviews(clinic_id, is_visible);

-- ── Auto-update `updated_at` ──────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists users_touch on public.users;
create trigger users_touch before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists sale_profiles_touch on public.sale_profiles;
create trigger sale_profiles_touch before update on public.sale_profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists clinic_profiles_touch on public.clinic_profiles;
create trigger clinic_profiles_touch before update on public.clinic_profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists campaigns_touch on public.campaigns;
create trigger campaigns_touch before update on public.campaigns
  for each row execute function public.touch_updated_at();

-- ── Auto-recalc clinic rating when reviews change ─────────────────────────
create or replace function public.recalc_clinic_rating(p_clinic_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_avg numeric(3,2);
  v_count integer;
begin
  select coalesce(round(avg(rating)::numeric, 2), 0), count(*)
    into v_avg, v_count
    from public.clinic_reviews
   where clinic_id = p_clinic_id and is_visible = true;
  update public.clinic_profiles
     set rating_avg = v_avg, rating_count = v_count
   where id = p_clinic_id;
end $$;

create or replace function public.clinic_review_after_change() returns trigger
language plpgsql as $$
begin
  perform public.recalc_clinic_rating(coalesce(new.clinic_id, old.clinic_id));
  return null;
end $$;

drop trigger if exists clinic_reviews_recalc on public.clinic_reviews;
create trigger clinic_reviews_recalc
  after insert or update or delete on public.clinic_reviews
  for each row execute function public.clinic_review_after_change();
