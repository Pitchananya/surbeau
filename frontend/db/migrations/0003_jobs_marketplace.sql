-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Phase 2 — Job marketplace for beauty professionals                       ║
-- ║                                                                          ║
-- ║ Adds:                                                                    ║
-- ║   - role 'candidate' enum value                                          ║
-- ║   - candidate_profiles (skills, experience, license files, bio)          ║
-- ║   - jobs (clinic posts positions)                                        ║
-- ║   - applications (candidate ↔ job M:N with cover letter + status)        ║
-- ║   - memberships (candidate Premium 300฿/year)                            ║
-- ║                                                                          ║
-- ║ Idempotent — uses IF NOT EXISTS / DO blocks.                             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── Role enum: add 'candidate' (Postgres 12+ supports IF NOT EXISTS) ──────
alter type user_role add value if not exists 'candidate';

-- ── Enums for new tables ──────────────────────────────────────────────────
do $$ begin
  create type job_status as enum ('open', 'closed', 'draft');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('pending', 'shortlisted', 'interviewing', 'hired', 'rejected', 'withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type employment_type as enum ('full_time', 'part_time', 'contract', 'freelance', 'internship');
exception when duplicate_object then null; end $$;

do $$ begin
  create type membership_plan as enum ('free', 'premium_year');
exception when duplicate_object then null; end $$;

do $$ begin
  create type membership_status as enum ('active', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

-- ── candidate_profiles ────────────────────────────────────────────────────
create table if not exists public.candidate_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references public.users(id) on delete cascade,
  bio               text,
  headline          text,              -- e.g. "Registered Nurse · Injector certified · 5 yrs"
  skills            text[] not null default '{}'::text[],  -- e.g. {'rn','injector','laser'}
  specialties       text[] not null default '{}'::text[],  -- e.g. {'นวด','โบท็อกซ์','reception'}
  experience_years  integer,
  license_files     jsonb not null default '[]'::jsonb,  -- [{type:'RN', url:'...'}]
  portfolio         jsonb not null default '[]'::jsonb,  -- [{title, image_url, description}]
  is_verified       boolean not null default false,      -- KYC: license verified by admin
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists candidate_profiles_skills_idx
  on public.candidate_profiles using gin(skills);
create index if not exists candidate_profiles_specialties_idx
  on public.candidate_profiles using gin(specialties);

-- ── jobs (clinic posts) ───────────────────────────────────────────────────
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references public.clinic_profiles(id) on delete cascade,
  title           text not null,
  description     text,
  required_skills text[] not null default '{}'::text[],
  employment_type employment_type not null default 'full_time',
  salary_min      numeric(12, 2),
  salary_max      numeric(12, 2),
  location        text,                       -- override clinic location if remote/branch
  is_remote       boolean not null default false,
  status          job_status not null default 'open',
  is_featured     boolean not null default false,
  closes_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (salary_min is null or salary_max is null or salary_max >= salary_min)
);
create index if not exists jobs_status_idx on public.jobs(status, is_featured);
create index if not exists jobs_clinic_idx on public.jobs(clinic_id);
create index if not exists jobs_skills_idx on public.jobs using gin(required_skills);

-- ── applications (candidate ↔ job) ────────────────────────────────────────
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  candidate_id  uuid not null references public.candidate_profiles(id) on delete cascade,
  cover_letter  text,
  resume_url    text,                  -- optional separate upload
  status        application_status not null default 'pending',
  status_updated_at timestamptz,
  status_updated_by uuid references public.users(id),
  created_at    timestamptz not null default now(),
  unique (job_id, candidate_id)        -- one application per candidate per job
);
create index if not exists applications_job_status_idx on public.applications(job_id, status);
create index if not exists applications_candidate_idx on public.applications(candidate_id);

-- ── memberships (candidate 300฿/yr) ───────────────────────────────────────
create table if not exists public.memberships (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  plan            membership_plan not null,
  status          membership_status not null default 'active',
  amount          numeric(12, 2) not null,
  payment_method  text,                 -- 'promptpay', 'card', 'truemoney'
  payment_ref     text,                 -- transaction ID from payment gateway
  paid_at         timestamptz not null default now(),
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);
create index if not exists memberships_user_idx on public.memberships(user_id, expires_at desc);
-- a user can only have ONE active membership at a time
create unique index if not exists memberships_one_active_per_user
  on public.memberships(user_id) where status = 'active';

-- ── Touch triggers for new tables ─────────────────────────────────────────
drop trigger if exists candidate_profiles_touch on public.candidate_profiles;
create trigger candidate_profiles_touch before update on public.candidate_profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists jobs_touch on public.jobs;
create trigger jobs_touch before update on public.jobs
  for each row execute function public.touch_updated_at();
