"use server";

// actions.js - Server actions cho module quản lý Banner. Cùng khuôn mẫu với
// app/admin/actions.js (dùng cho sản phẩm) nhưng tách riêng file để không
// đụng tới action của sản phẩm.

import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  createUploadTicket,
} from "@/lib/admin-banners";

// Chặn thao tác ghi nếu chưa đăng nhập.
async function requireAuth() {
  if (!(await isLoggedIn())) {
    throw new Error("Bạn cần đăng nhập.");
  }
}

// Banner chỉ hiển thị ở trang chủ -> chỉ cần làm mới trang chủ.
function revalidatePublic() {
  revalidatePath("/");
}

export async function createBannerUploadTicketAction(fileName) {
  await requireAuth();
  return createUploadTicket(fileName);
}

export async function createBannerAction(prevState, formData) {
  await requireAuth();
  try {
    await createBanner({
      title: (formData.get("title") || "").trim(),
      subtitle: (formData.get("subtitle") || "").trim(),
      image: (formData.get("image") || "").trim(),
      button_text: (formData.get("button_text") || "").trim(),
      button_link: (formData.get("button_link") || "").trim(),
      is_active: formData.get("is_active") === "on",
      sort_order: formData.get("sort_order"),
    });
    revalidatePublic();
    revalidatePath("/admin/banner");
    return { ok: true, message: "Đã thêm banner." };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updateBannerAction(prevState, formData) {
  await requireAuth();
  try {
    const id = formData.get("id");
    await updateBanner(id, {
      title: (formData.get("title") || "").trim(),
      subtitle: (formData.get("subtitle") || "").trim(),
      image: (formData.get("image") || "").trim(),
      button_text: (formData.get("button_text") || "").trim(),
      button_link: (formData.get("button_link") || "").trim(),
      is_active: formData.get("is_active") === "on",
      sort_order: formData.get("sort_order"),
    });
    revalidatePublic();
    revalidatePath("/admin/banner");
    return { ok: true, message: "Đã cập nhật banner." };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteBannerAction(formData) {
  await requireAuth();
  const id = formData.get("id");
  await deleteBanner(id);
  revalidatePublic();
  revalidatePath("/admin/banner");
}
