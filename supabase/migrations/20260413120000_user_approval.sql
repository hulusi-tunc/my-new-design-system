-- ============================================================================
-- Migration 001 — User approval flow
-- Run this once in the Supabase SQL editor after the base schema.sql.
-- Safe to re-run (idempotent).
-- ============================================================================

-- 1. Make github_username nullable (email signups don't have one)
alter table public.profiles
  alter column github_username drop not null;

-- 2. Approval status enum + columns
do $$ begin
  create type public.approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists approval_status public.approval_status not null default 'pending';

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists approved_at timestamptz;

alter table public.profiles
  add column if not exists approved_by uuid references public.profiles(id) on delete set null;

-- 3. Replace the handle_new_user trigger to:
--    - handle both OAuth (GitHub) and email/password signups
--    - auto-approve the admin on first signup
--    - store full_name from signup form metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    github_username,
    display_name,
    full_name,
    avatar_url,
    approval_status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username'),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    case
      when lower(new.email) = 'hulusitunc1@gmail.com'
        then 'approved'::public.approval_status
      else 'pending'::public.approval_status
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 4. Backfill: auto-approve the admin if their account already exists
update public.profiles
set approval_status = 'approved'::public.approval_status,
    approved_at = coalesce(approved_at, now())
where id in (
  select id from auth.users where lower(email) = 'hulusitunc1@gmail.com'
);

-- 5. RLS: admin can update any profile's approval_status + approved_at/by
drop policy if exists "Admin can update approval status" on public.profiles;
create policy "Admin can update approval status"
  on public.profiles for update
  using (
    exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and lower(u.email) = 'hulusitunc1@gmail.com'
    )
  );

-- 6. RLS: admin can view all profiles (including pending users' emails via join)
--    The existing "Profiles are viewable by everyone" already allows public select,
--    so nothing to add here. Admin reads will use a service-role route to join
--    with auth.users.email since auth.users isn't directly exposed.
