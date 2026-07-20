// products.js - Lớp truy vấn sản phẩm dùng chung cho toàn site.
// Có cấu hình Supabase -> đọc từ DB. Chưa có -> dùng dữ liệu tạm (products-data.js).
// Mọi hàm đều async để trang gọi await thống nhất, không phải sửa khi bật/tắt DB.

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import * as local from "@/lib/products-data";
import { isValidImageSrc } from "@/lib/utils";

// Câu select dùng chung: lấy cả product_variants liên quan (join theo
// product_id) để trang chi tiết có đủ dữ liệu chọn màu/size.
const SELECT_WITH_VARIANTS = "*, product_variants(id, color, size, image)";

// Chuẩn hóa 1 bản ghi từ DB về đúng hình dạng mà giao diện đang dùng.
// Lọc bỏ mọi entry ảnh không phải link hợp lệ (phòng trường hợp dữ liệu cũ
// lỡ lưu nhầm văn bản không phải URL vào cột images/variant image - next/image
// sẽ crash nếu nhận src không hợp lệ).
function normalize(row) {
  const images = Array.isArray(row.images)
    ? row.images.filter(isValidImageSrc)
    : [];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    description: row.description || "",
    images,
    // Danh sách màu/size khả dụng của sản phẩm (dùng cho các nút lựa chọn).
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    // Từng tổ hợp màu+size kèm ảnh riêng (dùng để đổi ảnh khi khách chọn).
    // Bỏ qua biến thể có ảnh không hợp lệ thay vì để nó làm crash trang.
    variants: Array.isArray(row.product_variants)
      ? row.product_variants
          .filter((v) => isValidImageSrc(v.image))
          .map((v) => ({
            id: v.id,
            color: v.color,
            size: v.size,
            image: v.image,
          }))
      : [],
  };
}

export async function getAllProducts() {
  if (!isSupabaseConfigured) return local.getAllProducts();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_VARIANTS)
    .order("created_at", { ascending: false });

  if (error || !data) return local.getAllProducts();
  return data.map(normalize);
}

export async function getProductBySlug(slug) {
  if (!isSupabaseConfigured) return local.getProductBySlug(slug);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_VARIANTS)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return normalize(data);
}

export async function getProductsByCategory(category) {
  if (!isSupabaseConfigured) return local.getProductsByCategory(category);

  const supabase = getSupabase();
  let query = supabase.from("products").select(SELECT_WITH_VARIANTS);
  if (category) query = query.eq("category", category);

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error || !data) return local.getProductsByCategory(category);
  return data.map(normalize);
}
