-- banners-schema.sql - Chạy file này trong Supabase (SQL Editor) để tạo bảng
-- banners + seed. KHÔNG đụng tới bảng products hay dữ liệu hiện có.
-- Các bước: Supabase Dashboard -> SQL Editor -> New query -> dán toàn bộ -> Run.

-- 1) Bảng banner
create table if not exists banners (
  id           bigint generated always as identity primary key,
  title        text default '',
  subtitle     text default '',
  image        text not null,
  button_text  text default '',
  button_link  text default '',
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2) Tự động cập nhật updated_at mỗi khi sửa 1 banner.
create or replace function set_banners_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_banners_updated_at on banners;
create trigger trg_banners_updated_at
  before update on banners
  for each row
  execute function set_banners_updated_at();

-- 3) Bật Row Level Security
alter table banners enable row level security;

-- 4) Cấp quyền đọc bảng cho anon/authenticated (bắt buộc - nếu thiếu sẽ báo
--    "permission denied for table banners").
grant select on table banners to anon, authenticated;

-- 5) Cho phép MỌI người ĐỌC banner (site công khai + trang admin đều đọc qua
--    khóa anon, giống cách đang làm với bảng products). Việc chỉ hiển thị
--    banner đang hoạt động (is_active = true) được lọc ở tầng ứng dụng
--    (lib/banners.js), không lọc ở policy, để trang admin vẫn xem được toàn
--    bộ banner (kể cả banner đang tắt).
drop policy if exists "public read banners" on banners;
create policy "public read banners"
  on banners for select
  using (true);

-- Ghi chú: Thêm/sửa/xóa được thực hiện phía server bằng service role key
-- (bỏ qua RLS), nên KHÔNG tạo policy insert/update/delete cho người dùng thường.

-- 6) Seed 2 banner hiện có (đúng ảnh đang dùng trong public/img/banner), để
--    site không bị trống banner ngay sau khi tạo bảng.
insert into banners (title, subtitle, image, button_text, button_link, is_active, sort_order) values
(
  'Shop Túi Xách', 'Đẹp - Bền - Giá tốt mỗi ngày',
  '/img/banner/baner.png', '', '', true, 1
),
(
  '', '',
  '/img/banner/baner2.png', '', '', true, 2
);

-- 7) Tạo Storage bucket "banner" để lưu ảnh admin upload sau này.
insert into storage.buckets (id, name, public)
values ('banner', 'banner', true)
on conflict (id) do nothing;

-- Cho phép đọc công khai ảnh trong bucket banner.
drop policy if exists "public read banner images" on storage.objects;
create policy "public read banner images"
  on storage.objects for select
  using (bucket_id = 'banner');
