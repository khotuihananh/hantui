"use client";

// ProductRow.js - Một hàng sản phẩm trong bảng quản trị.
// Bấm "Sửa" mở form sửa ngay dưới hàng; "Xóa" hỏi xác nhận rồi gọi server action.

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/config";
import ProductForm from "./ProductForm";
import { deleteProductAction } from "./actions";

export default function ProductRow({ product }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <tr>
        <td>
          <img
            src={product.images?.[0] || "/img/logo/logo.png"}
            alt={product.name}
          />
        </td>
        <td>{product.name}</td>
        <td>{formatPrice(product.price)}</td>
        <td>{PRODUCT_CATEGORIES[product.category] || product.category}</td>
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
              action={deleteProductAction}
              onSubmit={(e) => {
                if (!confirm(`Xóa sản phẩm "${product.name}"?`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={product.id} />
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
            <ProductForm product={product} onDone={() => setEditing(false)} />
          </td>
        </tr>
      )}
    </>
  );
}
