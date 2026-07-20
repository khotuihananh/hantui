// admin-banners.js - Thêm/sửa/xóa Banner qua service role (CHỈ dùng server).
// Cùng khuôn mẫu với lib/admin-products.js.

import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function createBanner(input) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const { error } = await supabase.from("banners").insert({
    title: input.title || "",
    subtitle: input.subtitle || "",
    image: input.image,
    button_text: input.button_text || "",
    button_link: input.button_link || "",
    is_active: Boolean(input.is_active),
    sort_order: Number(input.sort_order) || 0,
  });

  if (error) throw new Error(error.message);
}

export async function updateBanner(id, input) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const patch = {
    title: input.title || "",
    subtitle: input.subtitle || "",
    image: input.image,
    button_text: input.button_text || "",
    button_link: input.button_link || "",
    is_active: Boolean(input.is_active),
    sort_order: Number(input.sort_order) || 0,
  };

  const { error } = await supabase.from("banners").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBanner(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Upload 1 ảnh lên Storage bucket "banner", trả về đường dẫn public.
// (Giữ song song với uploadImage() của admin-products.js, phòng khi cần dùng
// đường upload trực tiếp qua Server Action thay vì vé ký sẵn.)
export async function uploadImage(file) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `b_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}_${file.size}.${ext}`;

  const { error } = await supabase.storage
    .from("banner")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("banner").getPublicUrl(path);
  return data.publicUrl;
}

// Cấp "vé" upload (signed upload URL): trình duyệt upload thẳng ảnh lên
// Supabase Storage, né giới hạn 4.5MB của Vercel Serverless Function - giống
// hệt cơ chế createUploadTicket() của admin-products.js.
export async function createUploadTicket(fileName) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
  const path = `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("banner")
    .createSignedUploadUrl(path);

  if (error) throw new Error(error.message);

  const { data: pub } = supabase.storage.from("banner").getPublicUrl(path);
  return { path: data.path, token: data.token, publicUrl: pub.publicUrl };
}
