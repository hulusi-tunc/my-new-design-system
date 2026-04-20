-- ============================================================================
-- Migration 003 — Catch up design_systems columns that publish/seed expect
-- Safe to re-run; every column is conditional. Uses defaults so existing
-- rows pick up valid values without backfilling.
-- ============================================================================

alter table public.design_systems
  add column if not exists platform text not null default 'web-react'
    check (platform in ('web-react','ios-swiftui','android-compose','flutter','react-native'));

alter table public.design_systems
  add column if not exists install_path text;

alter table public.design_systems
  add column if not exists default_branch text default 'main';

alter table public.design_systems
  add column if not exists technology text[] default '{}';

alter table public.design_systems
  add column if not exists tags text[] default '{}';

alter table public.design_systems
  add column if not exists architecture text;

alter table public.design_systems
  add column if not exists license text default 'MIT';

alter table public.design_systems
  add column if not exists manifest jsonb;

alter table public.design_systems
  add column if not exists published boolean default true;

alter table public.design_systems
  add column if not exists manifest_path text default 'ds-manifest.json';

alter table public.design_systems
  add column if not exists parent_id uuid references public.design_systems(id) on delete set null;
