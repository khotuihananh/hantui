-- variants-migration.sql
-- Thêm hệ thống phân loại sản phẩm (màu sắc / kích thước / biến thể).
-- Cách chạy: Supabase Dashboard -> SQL Editor -> New query -> dán toàn bộ file
-- này -> Run. An toàn chạy nhiều lần (dùng if not exists / add column if not
-- exists) và KHÔNG xóa dữ liệu sản phẩm hiện có.

-- 1) Thêm 2 cột mới vào bảng products:
--    - colors: danh sách màu sắc của sản phẩm, ví dụ ["Đen","Nâu","Kem"]
--    - sizes:  danh sách kích thước của sản phẩm, ví dụ ["S","M","L"]
-- Sản phẩm cũ (chưa có màu/size) sẽ mặc định là mảng rỗng - không ảnh hưởng
-- gì tới hiển thị/giỏ hàng hiện tại.
alter table products add column if not exists colors jsonb not null default '[]'::jsonb;
alter table products add column if not exists sizes  jsonb not null default '[]'::jsonb;

-- 2) Bảng product_variants: mỗi dòng là 1 tổ hợp (màu, size) + ảnh riêng.
create table if not exists product_variants (
  id           bigint generated always as identity primary key,
  product_id   bigint not null references products(id) on delete cascade,
  color        text not null default '',
  size         text not null default '',
  image        text not null default '',
  created_at   timestamptz not null default now(),
  -- Mỗi sản phẩm chỉ có 1 biến thể cho mỗi tổ hợp màu+size.
  unique (product_id, color, size)
);

create index if not exists product_variants_product_id_idx
  on product_variants (product_id);

-- 3) Bật RLS + cấp quyền đọc công khai (giống bảng products).
alter table product_variants enable row level security;
grant select on table product_variants to anon, authenticated;

drop policy if exists "public read product variants" on product_variants;
create policy "public read product variants"
  on product_variants for select
  using (true);

-- Ghi chú: giống bảng products, việc thêm/sửa/xóa biến thể chỉ thực hiện
-- được từ server bằng service role key (bỏ qua RLS) - không tạo policy
-- insert/update/delete cho người dùng thường.

-- 4) DỌN DỮ LIỆU ẢNH SAI (nếu có sản phẩm lỡ lưu nhầm 1 dòng KHÔNG PHẢI
-- link ảnh vào cột `images`, ví dụ dán nhầm 1 đoạn văn bản thay vì URL).
-- Link ảnh hợp lệ phải bắt đầu bằng "/" hoặc "http://"/"https://".
--
-- Trước tiên, chạy câu SELECT dưới đây để xem sản phẩm nào đang bị lỗi:
--
-- select id, name, images
-- from products
-- where exists (
--   select 1 from jsonb_array_elements_text(images) as img
--   where img !~ '^(/|https?://)'
-- );
--
-- Sau khi xác nhận đúng sản phẩm bị lỗi, chạy lệnh sau để loại bỏ các dòng
-- ảnh không hợp lệ ra khỏi cột images (giữ lại các ảnh hợp lệ khác):
--
-- update products
-- set images = (
--   select coalesce(jsonb_agg(img), '[]'::jsonb)
--   from jsonb_array_elements_text(images) as img
--   where img ~ '^(/|https?://)'
-- )
-- where exists (
--   select 1 from jsonb_array_elements_text(images) as img
--   where img !~ '^(/|https?://)'
-- );
