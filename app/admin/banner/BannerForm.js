"use client";

// BannerForm.js - Form thêm/sửa Banner. Dùng cho cả 2 trường hợp:
// - Không có "banner": chế độ thêm mới.
// - Có "banner": chế độ sửa (điền sẵn dữ liệu).
// Cùng khuôn mẫu upload-ảnh-thẳng-lên-Storage như ProductForm.js, nhưng chỉ
// nhận 1 ảnh (banner chỉ có 1 ảnh nền), có preview.

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  createBannerAction,
  updateBannerAction,
  createBannerUploadTicketAction,
} from "./actions";

export default function BannerForm({ banner = null, onDone }) {
  const isEdit = Boolean(banner);
  const action = isEdit ? updateBannerAction : createBannerAction;
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();
  const formRef = useRef(null);

  // Ảnh: giữ URL hiện tại (preview) trong state để hiển thị ảnh xem trước và
  // gửi kèm form qua input ẩn "image".
  const [imageUrl, setImageUrl] = useState(banner?.image || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      if (!isEdit && formRef.current) {
        formRef.current.reset();
        setImageUrl("");
      }
      if (onDone) onDone();
    }
  }, [state, isEdit, onDone, router]);

  // Ảnh mới chọn từ máy: upload thẳng lên Supabase Storage (bucket "banner")
  // bằng vé ký sẵn, né giới hạn 4.5MB của Vercel Serverless Function - giống
  // hệt cơ chế trong ProductForm.js.
  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setUploadError("Chưa cấu hình Supabase.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const ticket = await createBannerUploadTicketAction(file.name);
      const { error } = await supabase.storage
        .from("banner")
        .uploadToSignedUrl(ticket.path, ticket.token, file);
      if (error) throw error;
      setImageUrl(ticket.publicUrl);
    } catch (err) {
      setUploadError(err.message || "Lỗi upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form ref={formRef} action={formAction} className="admin-card">
      <h2>{isEdit ? "Sửa banner" : "Thêm banner mới"}</h2>

      {state?.error && <div className="admin-error">{state.error}</div>}
      {state?.message && <div className="admin-ok">{state.message}</div>}

      {isEdit && <input type="hidden" name="id" value={banner.id} />}
      <input type="hidden" name="image" value={imageUrl} />

      <div className="admin-field">
        <label>Tiêu đề</label>
        <input
          name="title"
          defaultValue={banner?.title || ""}
          placeholder="Ví dụ: Shop Túi Xách"
        />
      </div>

      <div className="admin-field">
        <label>Mô tả phụ</label>
        <input
          name="subtitle"
          defaultValue={banner?.subtitle || ""}
          placeholder="Ví dụ: Đẹp - Bền - Giá tốt mỗi ngày"
        />
      </div>

      <div className="admin-field">
        <label>Ảnh banner</label>
        <input type="file" accept="image/*" onChange={handleFileSelected} />
        <p className="admin-note">
          Ảnh được tải thẳng lên Supabase Storage ngay khi chọn.
        </p>

        {uploading && <p className="admin-note">Đang tải ảnh...</p>}
        {uploadError && <div className="admin-error">{uploadError}</div>}

        {imageUrl && (
          <div style={{ marginTop: 8 }}>
            <img
              src={imageUrl}
              alt="Xem trước banner"
              style={{
                width: "100%",
                maxWidth: 320,
                borderRadius: 8,
                display: "block",
              }}
            />
          </div>
        )}
      </div>

      <div className="admin-field">
        <label>Hoặc dán link ảnh</label>
        <input
          type="text"
          placeholder="/img/banner/baner.png hoặc https://..."
          defaultValue={banner?.image || ""}
          onChange={(e) => setImageUrl(e.target.value.trim())}
        />
      </div>

      <div className="admin-field">
        <label>Nút bấm - nội dung (tùy chọn, chưa hiển thị ở trang chủ)</label>
        <input
          name="button_text"
          defaultValue={banner?.button_text || ""}
          placeholder="Ví dụ: Mua ngay"
        />
      </div>

      <div className="admin-field">
        <label>Nút bấm - link (tùy chọn, chưa hiển thị ở trang chủ)</label>
        <input
          name="button_link"
          defaultValue={banner?.button_link || ""}
          placeholder="https://..."
        />
      </div>

      <div className="admin-field">
        <label>Thứ tự hiển thị</label>
        <input
          name="sort_order"
          type="number"
          step="1"
          defaultValue={banner?.sort_order ?? 0}
        />
      </div>

      <div className="admin-field">
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="is_active"
            style={{ width: "auto" }}
            defaultChecked={banner ? banner.is_active : true}
          />
          <span>Banner đang hoạt động (hiển thị ở trang chủ)</span>
        </label>
      </div>

      <div className="admin-actions">
        <button
          className="admin-btn"
          type="submit"
          disabled={pending || uploading || !imageUrl}
        >
          {uploading
            ? "Đang tải ảnh..."
            : pending
              ? "Đang lưu..."
              : isEdit
                ? "Lưu thay đổi"
                : "Thêm banner"}
        </button>
        {isEdit && onDone && (
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={onDone}
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
