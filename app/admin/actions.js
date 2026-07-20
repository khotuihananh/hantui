"use server";

// actions.js - Server actions cho trang admin. Chạy phía server, gọi lớp
// admin-products (service role) và làm mới cache trang public sau khi ghi.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  createSession,
  destroySession,
  isLoggedIn,
} from "@/lib/auth";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createUploadTicket,
} from "@/lib/admin-products";
import { isValidImageSrc } from "@/lib/utils";

// Chặn thao tác ghi nếu chưa đăng nhập.
async function requireAuth() {
  if (!(await isLoggedIn())) {
    throw new Error("Bạn cần đăng nhập.");
  }
}

// Làm mới các trang công khai để thấy dữ liệu mới ngay.
function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/san-pham");
  revalidatePath("/sitemap.xml");
}

export async function loginAction(prevState, formData) {
  const password = formData.get("password") || "";
  if (!checkPassword(password)) {
    return { error: "Mật khẩu không đúng." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin");
}

// Đọc danh sách ảnh từ form.
// LƯU Ý: nhiều field trong form đều dùng chung tên "imageUrls" (ảnh cũ giữ
// lại + ảnh mới upload xong + textarea dán link tay). formData.get() chỉ trả
// về giá trị ĐẦU TIÊN nên trước đây các ảnh còn lại bị lặng lẽ mất - phải
// dùng getAll() để lấy đủ tất cả.
// File ảnh (nếu người dùng chọn từ máy) đã được trình duyệt upload thẳng lên
// Supabase Storage trước khi submit form (xem ProductForm.js), nên ở đây chỉ
// còn nhận URL (chuỗi text, rất nhẹ) - không còn nhận file thô qua Server
// Action nữa, tránh giới hạn 4.5MB của Vercel.
//
// Mỗi dòng phải là link ảnh hợp lệ (bắt đầu bằng "/" hoặc "http(s)://").
// Nếu người dùng lỡ dán nhầm văn bản khác vào ô này, dòng đó sẽ khiến
// next/image báo lỗi ở trang chi tiết sản phẩm - nên chặn ngay tại đây thay
// vì lưu vào DB rồi mới vỡ ở trang hiển thị.
function collectImages(formData) {
  const images = [];
  const invalid = [];
  const entries = formData.getAll("imageUrls");
  for (const entry of entries) {
    String(entry)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((u) => {
        if (isValidImageSrc(u)) {
          images.push(u);
        } else {
          invalid.push(u);
        }
      });
  }
  if (invalid.length > 0) {
    const preview = invalid[0].slice(0, 60);
    throw new Error(
      `Có ${invalid.length} dòng trong ô "dán link ảnh" không phải link ảnh hợp lệ (ví dụ: "${preview}${invalid[0].length > 60 ? "..." : ""}"). Link ảnh phải bắt đầu bằng "/" (ảnh có sẵn trong thư mục public) hoặc "http://"/"https://". Vui lòng xóa/sửa dòng đó rồi lưu lại.`,
    );
  }
  return images;
}

// Đọc 1 field ẩn chứa JSON (mảng colors/sizes/variants do ProductForm.js
// serialize trước khi submit). Nếu thiếu hoặc lỗi parse -> coi như mảng rỗng
// (không chặn việc lưu sản phẩm chỉ vì phần phân loại trống).
function collectJsonField(formData, name) {
  const raw = formData.get(name);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export async function createUploadTicketAction(fileName) {
  await requireAuth();
  return createUploadTicket(fileName);
}

export async function createProductAction(prevState, formData) {
  await requireAuth();
  try {
    const images = await collectImages(formData);
    await createProduct({
      name: (formData.get("name") || "").trim(),
      price: formData.get("price"),
      category: formData.get("category"),
      description: (formData.get("description") || "").trim(),
      images,
      colors: collectJsonField(formData, "colorsJson"),
      sizes: collectJsonField(formData, "sizesJson"),
      variants: collectJsonField(formData, "variantsJson"),
    });
    revalidatePublic();
    return { ok: true, message: "Đã thêm sản phẩm." };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updateProductAction(prevState, formData) {
  await requireAuth();
  try {
    const id = Number(formData.get("id"));
    const images = await collectImages(formData);
    await updateProduct(id, {
      name: (formData.get("name") || "").trim(),
      price: formData.get("price"),
      category: formData.get("category"),
      description: (formData.get("description") || "").trim(),
      images,
      colors: collectJsonField(formData, "colorsJson"),
      sizes: collectJsonField(formData, "sizesJson"),
      variants: collectJsonField(formData, "variantsJson"),
      regenerateSlug: formData.get("regenerateSlug") === "on",
    });
    revalidatePublic();
    return { ok: true, message: "Đã cập nhật sản phẩm." };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteProductAction(formData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  await deleteProduct(id);
  revalidatePublic();
}
