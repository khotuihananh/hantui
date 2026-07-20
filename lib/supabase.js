// supabase.js - Khởi tạo kết nối Supabase.
// - Client công khai (anon): dùng để ĐỌC sản phẩm ở các trang.
// - Client admin (service role): dùng phía server cho thêm/sửa/xóa.
// Nếu chưa cấu hình khóa, hàm trả về null để site chạy bằng dữ liệu tạm.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Đã cấu hình Supabase hay chưa (dùng để quyết định đọc DB hay dữ liệu tạm).
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Client công khai - chỉ đọc dữ liệu công khai.
export function getSupabase() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Client quản trị - CHỈ dùng phía server (không lộ ra trình duyệt).
export function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

// Client dùng trong trình duyệt (admin) - CHỈ dùng để upload ảnh thẳng lên
// Storage bằng "vé" (signed upload URL) do server cấp, né giới hạn dung
// lượng request của Vercel Serverless Function (4.5MB). Key anon không có
// quyền ghi bảng products (đã chặn ở DB), nên an toàn khi lộ ra client.
export function getSupabaseBrowser() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
