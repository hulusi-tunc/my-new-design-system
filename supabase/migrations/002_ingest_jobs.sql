-- ============================================================================
-- Migration 002 — Ingest jobs table
-- Adds the async GitHub → draft manifest pipeline backing /ingest/new.
-- Safe to re-run (idempotent).
-- ============================================================================

create table if not exists public.ingest_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  repo_url text not null,
  platform text not null
    check (platform in ('web-react','ios-swiftui','android-compose','flutter','react-native')),
  branch text,
  subpath text,
  status text not null default 'queued'
    check (status in ('queued','running','done','failed')),
  progress jsonb,
  warnings jsonb,
  error text,
  draft_manifest jsonb,
  design_system_id uuid references public.design_systems(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists ingest_jobs_owner_idx on public.ingest_jobs(owner_id);
create index if not exists ingest_jobs_status_idx on public.ingest_jobs(status);

alter table public.ingest_jobs enable row level security;

drop policy if exists "Users view own ingest jobs" on public.ingest_jobs;
create policy "Users view own ingest jobs"
  on public.ingest_jobs for select using (auth.uid() = owner_id);

drop policy if exists "Users insert own ingest jobs" on public.ingest_jobs;
create policy "Users insert own ingest jobs"
  on public.ingest_jobs for insert with check (auth.uid() = owner_id);

drop policy if exists "Users update own ingest jobs" on public.ingest_jobs;
create policy "Users update own ingest jobs"
  on public.ingest_jobs for update using (auth.uid() = owner_id);

-- Reuse the updated_at trigger function defined in the base schema.
drop trigger if exists ingest_jobs_updated_at on public.ingest_jobs;
create trigger ingest_jobs_updated_at
  before update on public.ingest_jobs
  for each row execute function public.handle_updated_at();
