"use client";

// BannerRow.js - Một hàng banner trong bảng quản trị.
// Bấm "Sửa" mở form sửa ngay dưới hàng; "Xóa" hỏi xác nhận rồi gọi server action.
// Cùng khuôn mẫu với ProductRow.js.

import { useState } from "react";
import BannerForm from "./BannerForm";
import { deleteBannerAction } from "./actions";

export default function BannerRow({ banner }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <tr>
        <td>
          <img src={banner.image} alt={banner.title || "Banner"} />
        </td>
        <td>{banner.title || <em>(không có tiêu đề)</em>}</td>
        <td>{banner.sort_order}</td>
        <td>{banner.is_active ? "Đang hoạt động" : "Đã tắt"}</td>
        <td>
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Đóng" : "Sửa"}
            </button>
            <form
              action={deleteBannerAction}
              onSubmit={(e) => {
                if (!confirm(`Xóa banner "${banner.title || banner.image}"?`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={banner.id} />
              <button type="submit" className="admin-btn admin-btn--danger">
                Xóa
              </button>
            </form>
          </div>
        </td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={5}>
            <BannerForm banner={banner} onDone={() => setEditing(false)} />
          </td>
        </tr>
      )}
    </>
  );
}
