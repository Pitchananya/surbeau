-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Contact inquiries — leads from /contact-sales (clinic onboarding)        ║
-- ║ Stored separately from `leads` because they don't belong to a campaign.  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

do $$ begin
  create type inquiry_status as enum ('new', 'contacted', 'qualified', 'closed', 'spam');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_kind as enum ('clinic_premier', 'clinic_general', 'general');
exception when duplicate_object then null; end $$;

create table if not exists public.contact_inquiries (
  id            uuid primary key default gen_random_uuid(),
  kind          inquiry_kind not null default 'general',
  name          text not null,
  organization  text,             -- clinic name, company, etc
  email         text,
  phone         text,
  message       text,
  plan_interest text,             -- "verified" | "premier" | "custom" | null
  status        inquiry_status not null default 'new',
  notes         text,             -- admin internal notes
  handled_by    uuid references public.users(id),
  handled_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists contact_inquiries_status_idx
  on public.contact_inquiries(status, created_at desc);
create index if not exists contact_inquiries_kind_idx
  on public.contact_inquiries(kind);
