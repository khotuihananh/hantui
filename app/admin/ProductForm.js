"use client";

// ProductForm.js - Form thêm/sửa sản phẩm. Dùng cho cả 2 trường hợp:
// - Không có "product": chế độ thêm mới.
// - Có "product": chế độ sửa (điền sẵn dữ liệu).
// Gửi bằng server action qua useActionState để hiện thông báo kết quả.

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/config";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  createProductAction,
  updateProductAction,
  createUploadTicketAction,
} from "./actions";

export default function ProductForm({ product = null, onDone }) {
  const isEdit = Boolean(product);
  const action = isEdit ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();
  const formRef = useRef(null);
  const [existingImages, setExistingImages] = useState(
    product?.images || [],
  );

  // ==== Phân loại sản phẩm (màu sắc / kích thước / biến thể) ====
  const [colors, setColors] = useState(product?.colors || []);
  const [colorInput, setColorInput] = useState("");
  const [sizes, setSizes] = useState(product?.sizes || []);
  const [sizeInput, setSizeInput] = useState("");

  // Danh sách biến thể đã thêm: { id, color, size, image }
  const [variants, setVariants] = useState(
    (product?.variants || []).map((v) => ({
      id: `${v.color}__${v.size}`,
      color: v.color,
      size: v.size,
      image: v.image,
    })),
  );
  // Mini-form đang nhập để thêm 1 biến thể mới.
  const [variantColor, setVariantColor] = useState("");
  const [variantSize, setVariantSize] = useState("");
  // { name, status: "uploading"|"done"|"error", url?, error? }
  const [variantImage, setVariantImage] = useState(null);
  const [variantError, setVariantError] = useState("");

  function addColor() {
    const v = colorInput.trim();
    if (!v) return;
    if (!colors.includes(v)) setColors((list) => [...list, v]);
    setColorInput("");
  }

  function removeColor(v) {
    setColors((list) => list.filter((c) => c !== v));
  }

  function addSize() {
    const v = sizeInput.trim();
    if (!v) return;
    if (!sizes.includes(v)) setSizes((list) => [...list, v]);
    setSizeInput("");
  }

  function removeSize(v) {
    setSizes((list) => list.filter((s) => s !== v));
  }

  // Upload ảnh của 1 biến thể - dùng lại cơ chế "vé" (signed upload url)
  // giống ảnh sản phẩm chính, tránh giới hạn dung lượng request.
  async function handleVariantImageSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setVariantImage({ name: file.name, status: "error", error: "Chưa cấu hình Supabase." });
      return;
    }

    setVariantImage({ name: file.name, status: "uploading" });
    try {
      const ticket = await createUploadTicketAction(file.name);
      const { error } = await supabase.storage
        .from("products")
        .uploadToSignedUrl(ticket.path, ticket.token, file);
      if (error) throw error;
      setVariantImage({ name: file.name, status: "done", url: ticket.publicUrl });
    } catch (err) {
      setVariantImage({
        name: file.name,
        status: "error",
        error: err.message || "Lỗi upload",
      });
    }
  }

  function addVariant() {
    setVariantError("");
    if (!variantColor || !variantSize) {
      setVariantError("Chọn đủ màu và kích thước cho biến thể.");
      return;
    }
    if (!variantImage || variantImage.status !== "done") {
      setVariantError("Tải ảnh cho biến thể trước khi thêm.");
      return;
    }
    const id = `${variantColor}__${variantSize}`;
    setVariants((list) => {
      const rest = list.filter((v) => v.id !== id);
      return [...rest, { id, color: variantColor, size: variantSize, image: variantImage.url }];
    });
    setVariantColor("");
    setVariantSize("");
    setVariantImage(null);
  }

  function removeVariant(id) {
    setVariants((list) => list.filter((v) => v.id !== id));
  }

  // Ảnh mới chọn từ máy: upload thẳng lên Supabase Storage ngay khi chọn,
  // KHÔNG gửi file thô qua Server Action (né giới hạn 4.5MB của Vercel).
  // Mỗi phần tử: { id, name, status: "uploading"|"done"|"error", url?, error? }
  const [newImages, setNewImages] = useState([]);
  const uploadingCount = newImages.filter((i) => i.status === "uploading").length;

  // Sau khi lưu thành công: làm mới dữ liệu; nếu là thêm mới thì reset form.
  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      if (!isEdit && formRef.current) {
        formRef.current.reset();
        setExistingImages([]);
        setColors([]);
        setSizes([]);
        setVariants([]);
      }
      setNewImages([]);
      if (onDone) onDone();
    }
  }, [state, isEdit, onDone, router]);

  function removeExisting(url) {
    setExistingImages((list) => list.filter((u) => u !== url));
  }

  function removeNewImage(id) {
    setNewImages((list) => list.filter((i) => i.id !== id));
  }

  // Người dùng chọn file (có thể chọn nhiều cùng lúc): mỗi ảnh được upload
  // thẳng lên Supabase Storage bằng "vé" (signed upload URL) lấy từ server -
  // request lên server ở bước này chỉ có tên file, rất nhẹ, không đụng tới
  // giới hạn 4.5MB. Dữ liệu ảnh thật đi thẳng trình duyệt -> Supabase.
  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // cho phép chọn lại cùng file lần sau nếu cần

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setNewImages((list) => [
        ...list,
        ...files.map((f) => ({
          id: `${f.name}_${f.size}_${Math.random()}`,
          name: f.name,
          status: "error",
          error: "Chưa cấu hình Supabase.",
        })),
      ]);
      return;
    }

    for (const file of files) {
      const id = `${file.name}_${file.size}_${Math.random()}`;
      setNewImages((list) => [
        ...list,
        { id, name: file.name, status: "uploading" },
      ]);

      try {
        const ticket = await createUploadTicketAction(file.name);
        const { error } = await supabase.storage
          .from("products")
          .uploadToSignedUrl(ticket.path, ticket.token, file);
        if (error) throw error;

        setNewImages((list) =>
          list.map((i) =>
            i.id === id ? { ...i, status: "done", url: ticket.publicUrl } : i,
          ),
        );
      } catch (err) {
        setNewImages((list) =>
          list.map((i) =>
            i.id === id
              ? { ...i, status: "error", error: err.message || "Lỗi upload" }
              : i,
          ),
        );
      }
    }
  }

  return (
    <form ref={formRef} action={formAction} className="admin-card">
      <h2>{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>

      {state?.error && <div className="admin-error">{state.error}</div>}
      {state?.message && <div className="admin-ok">{state.message}</div>}

      {isEdit && <input type="hidden" name="id" value={product.id} />}

      <div className="admin-field">
        <label>Tên sản phẩm</label>
        <input
          name="name"
          defaultValue={product?.name || ""}
          required
          placeholder="Ví dụ: Túi xách nữ Dor"
        />
      </div>

      <div className="admin-field">
        <label>Giá (VNĐ)</label>
        <input
          name="price"
          type="number"
          min="0"
          step="1000"
          defaultValue={product?.price ?? ""}
          required
          placeholder="50000"
        />
      </div>

      <div className="admin-field">
        <label>Danh mục</label>
        <select name="category" defaultValue={product?.category || "tui-xach"}>
          {Object.entries(PRODUCT_CATEGORIES).map(([slug, label]) => (
            <option key={slug} value={slug}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label>Mô tả</label>
        <textarea
          name="description"
          defaultValue={product?.description || ""}
          placeholder="Mô tả chi tiết sản phẩm..."
        />
      </div>

      {/* Ảnh hiện có (khi sửa): bỏ tick để loại ảnh khỏi sản phẩm. */}
      {isEdit && existingImages.length > 0 && (
        <div className="admin-field">
          <label>Ảnh hiện có (giữ lại)</label>
          <div className="admin-actions">
            {existingImages.map((url) => (
              <div key={url} style={{ textAlign: "center" }}>
                <img
                  src={url}
                  alt=""
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 6,
                    display: "block",
                  }}
                />
                {/* Ảnh giữ lại được gửi kèm dưới dạng URL nhập tay ẩn. */}
                <input type="hidden" name="imageUrls" value={url} />
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  style={{ marginTop: 4, padding: "4px 8px" }}
                  onClick={() => removeExisting(url)}
                >
                  Bỏ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-field">
        <label>Thêm ảnh (tải từ máy)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
        />
        <p className="admin-note">
          Có thể chọn nhiều ảnh cùng lúc. Ảnh được tải thẳng lên Supabase
          Storage ngay khi chọn (không giới hạn bởi dung lượng request).
        </p>

        {newImages.length > 0 && (
          <div className="admin-actions">
            {newImages.map((img) => (
              <div key={img.id} style={{ textAlign: "center", width: 64 }}>
                {img.status === "done" ? (
                  <>
                    <img
                      src={img.url}
                      alt=""
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 6,
                        display: "block",
                      }}
                    />
                    {/* Ảnh mới upload xong: gửi URL kèm form (giống ảnh cũ). */}
                    <input type="hidden" name="imageUrls" value={img.url} />
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      style={{ marginTop: 4, padding: "4px 8px" }}
                      onClick={() => removeNewImage(img.id)}
                    >
                      Bỏ
                    </button>
                  </>
                ) : (
                  <div
                    style={{
                      fontSize: 12,
                      wordBreak: "break-word",
                      color: img.status === "error" ? "#e33" : "inherit",
                    }}
                  >
                    {img.name}
                    <br />
                    {img.status === "uploading"
                      ? "Đang tải..."
                      : `Lỗi: ${img.error}`}
                    {img.status === "error" && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        style={{ marginTop: 4, padding: "2px 6px" }}
                        onClick={() => removeNewImage(img.id)}
                      >
                        Bỏ
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-field">
        <label>Hoặc dán link ảnh (mỗi dòng 1 link)</label>
        <textarea
          name="imageUrls"
          placeholder="/img/products/1/a (1).jpg&#10;https://..."
        />
      </div>

      {/* ==== PHÂN LOẠI SẢN PHẨM (màu sắc / kích thước / biến thể) ==== */}
      <div className="admin-field">
        <label>Màu sắc</label>
        <div className="variant-input-row">
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder="Ví dụ: Đen"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor();
              }
            }}
          />
          <button type="button" className="admin-btn admin-btn--ghost" onClick={addColor}>
            + Thêm màu
          </button>
        </div>
        {colors.length > 0 && (
          <div className="variant-tag-list">
            {colors.map((c) => (
              <span key={c} className="variant-tag">
                {c}
                <button type="button" onClick={() => removeColor(c)} aria-label={`Bỏ màu ${c}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="admin-field">
        <label>Kích thước</label>
        <div className="variant-input-row">
          <input
            type="text"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder="Ví dụ: M"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSize();
              }
            }}
          />
          <button type="button" className="admin-btn admin-btn--ghost" onClick={addSize}>
            + Thêm size
          </button>
        </div>
        {sizes.length > 0 && (
          <div className="variant-tag-list">
            {sizes.map((s) => (
              <span key={s} className="variant-tag">
                {s}
                <button type="button" onClick={() => removeSize(s)} aria-label={`Bỏ size ${s}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="admin-field">
        <label>Biến thể (màu + size + ảnh riêng)</label>

        {variants.length > 0 && (
          <div className="admin-actions" style={{ marginBottom: 12 }}>
            {variants.map((v) => (
              <div key={v.id} style={{ textAlign: "center" }}>
                <img
                  src={v.image}
                  alt={`${v.color} - ${v.size}`}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 6,
                    display: "block",
                  }}
                />
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {v.color} / {v.size}
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  style={{ marginTop: 4, padding: "4px 8px" }}
                  onClick={() => removeVariant(v.id)}
                >
                  Bỏ
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="variant-builder">
          <select
            value={variantColor}
            onChange={(e) => setVariantColor(e.target.value)}
            disabled={colors.length === 0}
          >
            <option value="">-- Màu --</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={variantSize}
            onChange={(e) => setVariantSize(e.target.value)}
            disabled={sizes.length === 0}
          >
            <option value="">-- Size --</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input type="file" accept="image/*" onChange={handleVariantImageSelected} />

          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={addVariant}
            disabled={variantImage?.status === "uploading"}
          >
            + Thêm biến thể
          </button>
        </div>

        {variantImage && (
          <p className="admin-note">
            {variantImage.status === "uploading" && `Đang tải ${variantImage.name}...`}
            {variantImage.status === "done" && `Ảnh đã sẵn sàng: ${variantImage.name}`}
            {variantImage.status === "error" && `Lỗi: ${variantImage.error}`}
          </p>
        )}
        {variantError && <div className="admin-error">{variantError}</div>}
        {colors.length === 0 && (
          <p className="admin-note">Thêm ít nhất 1 màu ở trên để tạo biến thể.</p>
        )}
      </div>

      {/* Gửi kèm colors/sizes/variants dưới dạng JSON để server action đọc. */}
      <input type="hidden" name="colorsJson" value={JSON.stringify(colors)} />
      <input type="hidden" name="sizesJson" value={JSON.stringify(sizes)} />
      <input
        type="hidden"
        name="variantsJson"
        value={JSON.stringify(
          variants.map((v) => ({ color: v.color, size: v.size, image: v.image })),
        )}
      />

      {isEdit && (
        <div className="admin-field">
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" name="regenerateSlug" style={{ width: "auto" }} />
            <span>Cập nhật lại đường dẫn URL theo tên mới</span>
          </label>
        </div>
      )}

      <div className="admin-actions">
        <button
          className="admin-btn"
          type="submit"
          disabled={pending || uploadingCount > 0 || variantImage?.status === "uploading"}
        >
          {uploadingCount > 0 || variantImage?.status === "uploading"
            ? "Đang tải ảnh..."
            : pending
              ? "Đang lưu..."
              : isEdit
                ? "Lưu thay đổi"
                : "Thêm sản phẩm"}
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
