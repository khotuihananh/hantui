"use client";

// ProductDetail.js - Phần tương tác của trang chi tiết: gallery ảnh,
// chọn số lượng, thêm vào giỏ, khối "Liên hệ mua ngay" (Gọi/Zalo/Messenger).
// Khớp đúng bản gốc mockup/Goc: khối liên hệ chỉ là link liên hệ nhanh,
// không đụng tới logic giỏ hàng.

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import { CONTACT, ORDER_LINKS } from "@/lib/config";

export default function ProductDetail({ product }) {
  const [index, setIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const images = product.images || [];
  const variants = product.variants || [];

  // ==== Phân loại sản phẩm (màu sắc / kích thước) ====
  // Nếu sản phẩm chưa khai báo colors/sizes riêng, suy ra từ danh sách
  // variants (để vẫn hoạt động với dữ liệu cũ).
  const colors =
    product.colors && product.colors.length
      ? product.colors
      : [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const sizes =
    product.sizes && product.sizes.length
      ? product.sizes
      : [...new Set(variants.map((v) => v.size).filter(Boolean))];

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Khi đã chọn đủ màu + size -> tìm đúng biến thể tương ứng và đổi ảnh lớn.
  // Nếu chưa chọn đủ (thiếu màu hoặc size) -> giữ nguyên ảnh đang xem.
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const match = variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize,
      );
      setSelectedVariant(match || null);
    } else {
      setSelectedVariant(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor, selectedSize]);

  function selectColor(c) {
    setSelectedColor((cur) => (cur === c ? null : c));
  }

  function selectSize(s) {
    setSelectedSize((cur) => (cur === s ? null : s));
  }

  // Ảnh lớn đang hiển thị: ưu tiên ảnh của biến thể đang chọn (đè lên ảnh
  // gallery mặc định); nếu chưa chọn đủ màu/size thì giữ nguyên ảnh đang xem.
  const mainSrc = selectedVariant?.image || images[index];
  // Nếu ảnh biến thể trùng với 1 ảnh có sẵn trong gallery, thumbnail tương
  // ứng cũng được highlight theo ("thumbnail cập nhật theo ảnh mới").
  const activeIndex = selectedVariant
    ? images.indexOf(selectedVariant.image)
    : index;

  function prev() {
    setSelectedColor(null);
    setSelectedSize(null);
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setSelectedColor(null);
    setSelectedSize(null);
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function selectThumb(i) {
    // Khách bấm vào 1 thumbnail cụ thể: quay lại xem ảnh gallery gốc,
    // không còn bị ảnh biến thể "ghi đè" nữa.
    setSelectedColor(null);
    setSelectedSize(null);
    setIndex(i);
  }

  function handleAddToCart() {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      color: selectedColor || null,
      size: selectedSize || null,
      image: selectedVariant?.image || images[0] || null,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="product-detail">
      {/* ẢNH LỚN + ẢNH NHỎ */}
      <section className="gallery">
        <div className="gallery__main">
          <button
            className="gallery__nav gallery__nav--prev"
            type="button"
            aria-label="Ảnh trước"
            onClick={prev}
          >
            ❮
          </button>
          {mainSrc ? (
            <Image
              id="mainImage"
              src={mainSrc}
              alt={product.name}
              width={0}
              height={0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="gallery__main-img"
              style={{ width: "100%", height: "auto" }}
              priority={activeIndex === 0}
            />
          ) : (
            <div
              className="gallery__main-img"
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f2f2f2",
                color: "#999",
              }}
            >
              Chưa có ảnh
            </div>
          )}
          <button
            className="gallery__nav gallery__nav--next"
            type="button"
            aria-label="Ảnh sau"
            onClick={next}
          >
            ❯
          </button>
        </div>
        <div className="gallery__thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              className={`gallery__thumb${i === activeIndex ? " is-active" : ""}`}
              onClick={() => selectThumb(i)}
            >
              <Image
                src={src}
                alt={`Ảnh ${i + 1}`}
                fill
                sizes="72px"
                className="gallery__thumb-img"
              />
            </button>
          ))}
        </div>
      </section>

      {/* THÔNG TIN SẢN PHẨM */}
      <section className="product-info">
        <h1 className="product-info__name">{product.name}</h1>
        <div className="product-info__price">{formatPrice(product.price)}</div>

        {colors.length > 0 && (
          <div className="option-group">
            <div className="option-group__label">Màu sắc</div>
            <div className="option-group__list">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`option-pill${selectedColor === c ? " is-active" : ""}`}
                  onClick={() => selectColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="option-group">
            <div className="option-group__label">Kích thước</div>
            <div className="option-group__list">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`option-pill${selectedSize === s ? " is-active" : ""}`}
                  onClick={() => selectSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="qty-selector">
          <button
            className="qty-selector__btn"
            type="button"
            onClick={() => setQty((q) => (q > 1 ? q - 1 : 1))}
          >
            -
          </button>
          <span className="qty-selector__value">{qty}</span>
          <button
            className="qty-selector__btn"
            type="button"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>

        <div className="product-info__actions">
          <button className="btn" type="button" onClick={handleAddToCart}>
            {added ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ hàng"}
          </button>
        </div>

        {/* Nút liên hệ mua ngay: chỉ là link liên hệ nhanh, không đụng giỏ hàng */}
        <div className="buy-now">
          <div className="buy-now__label">Liên hệ mua ngay</div>
          <div className="buy-now__actions">
            <a
              href={`tel:${CONTACT.hotline}`}
              className="buy-now__btn buy-now__btn--call"
              aria-label="Gọi điện đặt mua"
            >
              <img src="/img/icons/phone.png" alt="" />
              <span>Gọi điện</span>
            </a>
            <a
              href={ORDER_LINKS.zalo}
              className="buy-now__btn buy-now__btn--zalo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat Zalo đặt mua"
            >
              <img src="/img/icons/zalo.png" alt="" />
              <span>Chat Zalo</span>
            </a>
            <a
              href={ORDER_LINKS.facebook}
              className="buy-now__btn buy-now__btn--fb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nhắn Messenger đặt mua"
            >
              <img src="/img/icons/messenger.png" alt="" />
              <span>Messenger</span>
            </a>
          </div>
        </div>

        <h2 className="product-info__desc-title" style={{ marginTop: 20 }}>
          Mô tả sản phẩm
        </h2>
        <p className="product-info__desc">{product.description}</p>
      </section>
    </div>
  );
}
