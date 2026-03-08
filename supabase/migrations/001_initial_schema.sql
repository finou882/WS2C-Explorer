-- =============================================
-- 既存の pos テーブルを使用
-- テーブル構造:
--   id: uuid (primary key)
--   name: text
--   pieces: int8
--   category: text
--   status: text
--   location: text
--   timestamp: timestamptz
-- =============================================

-- 既にテーブルが存在する場合はスキップ
-- pos テーブルは Supabase Dashboard で既に作成済み

-- Enable Row Level Security (まだ有効でない場合)
alter table pos enable row level security;

-- Policies for pos table (all authenticated users can CRUD)
create policy "Authenticated users can view pos"
  on pos for select
  to authenticated
  using (true);

create policy "Authenticated users can create pos"
  on pos for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update pos"
  on pos for update
  to authenticated
  using (true);

create policy "Authenticated users can delete pos"
  on pos for delete
  to authenticated
  using (true);

-- Indexes for better performance
create index if not exists pos_category_idx on pos (category);
create index if not exists pos_status_idx on pos (status);
create index if not exists pos_location_idx on pos (location);
