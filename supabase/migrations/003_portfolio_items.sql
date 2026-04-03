-- Portfolio items table
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null default '',
  tags text[] not null default '{}',
  markdown text not null,
  author text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_items_user_id_idx on public.portfolio_items(user_id);
create index if not exists portfolio_items_updated_at_idx on public.portfolio_items(updated_at desc);

alter table public.portfolio_items enable row level security;

drop policy if exists "portfolio_items_select_own" on public.portfolio_items;
create policy "portfolio_items_select_own"
  on public.portfolio_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "portfolio_items_insert_own" on public.portfolio_items;
create policy "portfolio_items_insert_own"
  on public.portfolio_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "portfolio_items_update_own" on public.portfolio_items;
create policy "portfolio_items_update_own"
  on public.portfolio_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "portfolio_items_delete_own" on public.portfolio_items;
create policy "portfolio_items_delete_own"
  on public.portfolio_items
  for delete
  to authenticated
  using (auth.uid() = user_id);
