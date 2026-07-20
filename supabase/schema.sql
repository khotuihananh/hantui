-- schema.sql - Chạy file này trong Supabase (SQL Editor) để tạo bảng + seed.
-- Các bước: Supabase Dashboard -> SQL Editor -> New query -> dán toàn bộ -> Run.

-- 1) Bảng sản phẩm
create table if not exists products (
  id           bigint generated always as identity primary key,
  slug         text unique not null,
  name         text not null,
  price        numeric not null default 0,
  category     text not null default 'tui-xach',
  description  text default '',
  images       jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

-- 2) Bật Row Level Security
alter table products enable row level security;

-- 3) Cấp quyền đọc bảng cho anon/authenticated (bắt buộc - nếu thiếu sẽ báo
--    "permission denied for table products"). Đây là quyền cấp-bảng, khác với
--    policy RLS bên dưới (policy quyết định ĐƯỢC ĐỌC HÀNG NÀO trong bảng).
grant select on table products to anon, authenticated;

-- 4) Cho phép MỌI người ĐỌC sản phẩm (site công khai).
drop policy if exists "public read products" on products;
create policy "public read products"
  on products for select
  using (true);

-- Ghi chú: Thêm/sửa/xóa được thực hiện phía server bằng service role key
-- (bỏ qua RLS), nên KHÔNG tạo policy insert/update/delete cho người dùng thường.
-- Điều này đảm bảo chỉ admin (qua server) mới sửa được dữ liệu.

-- 4) Seed 4 sản phẩm hiện có (ảnh trỏ vào thư mục public/img sẵn có).
insert into products (slug, name, price, category, description, images) values

-- 5) Tạo Storage bucket "products" để lưu ảnh admin upload sau này.
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Cho phép đọc công khai ảnh trong bucket products.
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'products');
