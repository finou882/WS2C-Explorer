-- users_permission table RLS policies
-- This migration assumes public.users_permission has at least:
--   email text
--   permission text

alter table if exists public.users_permission enable row level security;

-- Read only own rows
drop policy if exists "users_permission_select_own" on public.users_permission;
create policy "users_permission_select_own"
  on public.users_permission
  for select
  to authenticated
  using (email = auth.email());

-- Insert only own rows
drop policy if exists "users_permission_insert_own" on public.users_permission;
create policy "users_permission_insert_own"
  on public.users_permission
  for insert
  to authenticated
  with check (email = auth.email());

-- Update only own rows
drop policy if exists "users_permission_update_own" on public.users_permission;
create policy "users_permission_update_own"
  on public.users_permission
  for update
  to authenticated
  using (email = auth.email())
  with check (email = auth.email());

-- Delete only own rows
drop policy if exists "users_permission_delete_own" on public.users_permission;
create policy "users_permission_delete_own"
  on public.users_permission
  for delete
  to authenticated
  using (email = auth.email());
