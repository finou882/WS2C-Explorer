-- Supabase用 活動日テーブル作成SQL（user_idなし）
create table activity_days (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);
