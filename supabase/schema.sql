-- ============================================================================
-- DS Registry — Database Schema
-- Run this in the Supabase SQL Editor to set up all tables, RLS, and triggers.
-- ============================================================================

-- ── Profiles (mirrors auth.users with public-facing fields) ──

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- ── Design systems ──

create table if not exists public.design_systems (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  version text not null,

  -- Ownership (nullable for seed data; required for user-published systems)
  owner_id uuid references public.profiles(id) on delete set null,

  -- Source location (GitHub)
  repository_url text not null,
  manifest_path text default 'ds-manifest.json',
  install_path text,
  default_branch text default 'main',

  -- Metadata
  technology text[] default '{}',
  tags text[] default '{}',
  architecture text,
  license text default 'MIT',

  -- Fork tracking
  parent_id uuid references public.design_systems(id) on delete set null,

  -- Cached manifest JSON (refreshed from GitHub periodically)
  manifest jsonb,

  -- Publishing
  published boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Stats ──

create table if not exists public.design_system_stats (
  design_system_id uuid primary key references public.design_systems(id) on delete cascade,
  views integer default 0,
  installs integer default 0,
  stars integer default 0,
  updated_at timestamptz default now()
);

-- ── Indexes ──

create index if not exists design_systems_slug_idx on public.design_systems(slug);
create index if not exists design_systems_owner_idx on public.design_systems(owner_id);
create index if not exists design_systems_published_idx
  on public.design_systems(published) where published = true;
create index if not exists design_systems_tags_idx
  on public.design_systems using gin(tags);
create index if not exists design_systems_technology_idx
  on public.design_systems using gin(technology);

-- ── Row Level Security ──

alter table public.profiles enable row level security;
alter table public.design_systems enable row level security;
alter table public.design_system_stats enable row level security;

-- Profiles: public read, owner write
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Design systems: public read if published, owner full access
drop policy if exists "Published design systems are viewable by everyone"
  on public.design_systems;
create policy "Published design systems are viewable by everyone"
  on public.design_systems for select using (published = true);

drop policy if exists "Owners can view their own systems" on public.design_systems;
create policy "Owners can view their own systems"
  on public.design_systems for select using (auth.uid() = owner_id);

drop policy if exists "Owners can insert their own systems" on public.design_systems;
create policy "Owners can insert their own systems"
  on public.design_systems for insert with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their own systems" on public.design_systems;
create policy "Owners can update their own systems"
  on public.design_systems for update using (auth.uid() = owner_id);

drop policy if exists "Owners can delete their own systems" on public.design_systems;
create policy "Owners can delete their own systems"
  on public.design_systems for delete using (auth.uid() = owner_id);

-- Stats: public read, writes via service role only
drop policy if exists "Stats are viewable by everyone" on public.design_system_stats;
create policy "Stats are viewable by everyone"
  on public.design_system_stats for select using (true);

-- ── Triggers ──

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, github_username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on design_systems
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists design_systems_updated_at on public.design_systems;
create trigger design_systems_updated_at
  before update on public.design_systems
  for each row execute function public.handle_updated_at();

-- Auto-create stats row when a design system is created
create or replace function public.handle_new_design_system()
returns trigger as $$
begin
  insert into public.design_system_stats (design_system_id)
  values (new.id)
  on conflict (design_system_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists design_systems_create_stats on public.design_systems;
create trigger design_systems_create_stats
  after insert on public.design_systems
  for each row execute function public.handle_new_design_system();
