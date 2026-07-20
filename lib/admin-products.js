// admin-products.js - Thêm/sửa/xóa sản phẩm qua service role (CHỈ dùng server).
// Service role bỏ qua RLS nên chỉ code phía server mới ghi được dữ liệu.

import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

// Tạo slug không trùng: nếu "tui-xach-do" đã tồn tại thì thành "tui-xach-do-2".
async function makeUniqueSlug(supabase, name, ignoreId = null) {
  const base = slugify(name) || "san-pham";
  let slug = base;
  let n = 1;

  // Thử tối đa vài lần cho tới khi slug chưa được dùng.
  // (đủ dùng cho quy mô shop nhỏ)
  while (true) {
    let query = supabase.from("products").select("id").eq("slug", slug);
    if (ignoreId) query = query.neq("id", ignoreId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// Chuẩn hóa danh sách variant nhận từ form: giữ lại variant có ảnh và có
// ÍT NHẤT 1 trong 2 (màu HOẶC size) - không bắt buộc phải có đồng thời cả
// 2, để biến thể có thể đăng độc lập theo từng thuộc tính. Bỏ khoảng
// trắng thừa.
function normalizeVariants(variants) {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((v) => ({
      color: String(v?.color || "").trim(),
      size: String(v?.size || "").trim(),
      image: String(v?.image || "").trim(),
    }))
    .filter((v) => (v.color || v.size) && v.image);
}

function normalizeStringList(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const v = String(raw || "").trim();
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

// Ghi lại toàn bộ biến thể (product_variants) của 1 sản phẩm: xóa hết
// variant cũ rồi chèn lại danh sách mới - đơn giản và luôn đồng bộ đúng với
// những gì admin đang thấy trên form.
async function syncVariants(supabase, productId, variants) {
  const rows = normalizeVariants(variants);

  const { error: delErr } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);
  if (delErr) throw new Error(delErr.message);

  if (rows.length === 0) return;

  const { error: insErr } = await supabase.from("product_variants").insert(
    rows.map((v) => ({
      product_id: productId,
      color: v.color,
      size: v.size,
      image: v.image,
    })),
  );
  if (insErr) throw new Error(insErr.message);
}

export async function createProduct(input) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const slug = await makeUniqueSlug(supabase, input.name);

  const { data, error } = await supabase
    .from("products")
    .insert({
      slug,
      name: input.name,
      price: Number(input.price) || 0,
      category: input.category,
      description: input.description || "",
      images: input.images || [],
      colors: normalizeStringList(input.colors),
      sizes: normalizeStringList(input.sizes),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await syncVariants(supabase, data.id, input.variants);
}

export async function updateProduct(id, input) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const patch = {
    name: input.name,
    price: Number(input.price) || 0,
    category: input.category,
    description: input.description || "",
    images: input.images || [],
    colors: normalizeStringList(input.colors),
    sizes: normalizeStringList(input.sizes),
  };

  // Nếu đổi tên thì cập nhật lại slug (giữ URL khớp tên mới).
  if (input.regenerateSlug) {
    patch.slug = await makeUniqueSlug(supabase, input.name, id);
  }

  const { error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await syncVariants(supabase, id, input.variants);
}

export async function deleteProduct(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Upload 1 ảnh lên Storage bucket "products", trả về đường dẫn public.
export async function uploadImage(file) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  // Tên file dựa trên nội dung request (không dùng Math.random / Date).
  const path = `p_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}_${file.size}.${ext}`;

  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return data.publicUrl;
}

// Cấp "vé" upload (signed upload URL): trình duyệt sẽ dùng vé này để tải ảnh
// THẲNG lên Supabase Storage, không đi qua Server Action nữa. Nhờ vậy dữ
// liệu ảnh (nặng) không bị giới hạn 4.5MB của Vercel Serverless Function -
// request gửi lên server ở đây chỉ có tên file (rất nhẹ).
export async function createUploadTicket(fileName) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
  const path = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("products")
    .createSignedUploadUrl(path);

  if (error) throw new Error(error.message);

  const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
  return { path: data.path, token: data.token, publicUrl: pub.publicUrl };
}
