// banners.js - Lớp truy vấn Banner dùng chung cho toàn site.
// Có cấu hình Supabase -> đọc từ DB. Chưa có -> dùng dữ liệu tạm (banners-data.js).
// Cùng khuôn mẫu với lib/products.js.

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import * as local from "@/lib/banners-data";

// Chuẩn hóa 1 bản ghi từ DB về đúng hình dạng mà giao diện đang dùng.
function normalize(row) {
  return {
    id: row.id,
    title: row.title || "",
    subtitle: row.subtitle || "",
    image: row.image,
    button_text: row.button_text || "",
    button_link: row.button_link || "",
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order) || 0,
  };
}

// Dùng cho trang chủ: chỉ lấy banner đang hoạt động, theo đúng thứ tự sắp xếp.
export async function getActiveBanners() {
  if (!isSupabaseConfigured) return local.getActiveBanners();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return local.getActiveBanners();
  return data.map(normalize);
}

// Dùng cho trang admin: lấy TẤT CẢ banner (kể cả đang tắt) để quản lý.
export async function getAllBanners() {
  if (!isSupabaseConfigured) return local.getAllBanners();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return local.getAllBanners();
  return data.map(normalize);
}
