"use client";

// CartView.js - Giỏ hàng (client, dùng localStorage). Khớp đúng bản gốc
// mockup/Goc: tăng/giảm/xóa, nút "Đặt hàng" báo cảm ơn rồi xóa giỏ.

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { getCart, updateCartItemQty, removeFromCart } from "@/lib/cart";
import { CONTACT, ORDER_LINKS } from "@/lib/config";

export default function CartView() {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);

  // Đọc giỏ hàng sau khi mount (localStorage chỉ có ở phía client).
  useEffect(() => {
    setCart(getCart());
    setReady(true);
    const update = () => setCart(getCart());
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  function changeQty(key, qty) {
    updateCartItemQty(key, qty);
    setCart(getCart());
  }

  function remove(key) {
    removeFromCart(key);
    setCart(getCart());
  }

  // Mỗi dòng giỏ hàng đã tự mang đủ tên/ảnh/giá (lưu lúc thêm vào giỏ), nên
  // không cần tra cứu lại danh sách sản phẩm nữa - kể cả khi khác màu/size,
  // vẫn hiển thị đúng như 2 dòng riêng biệt.
  const lines = cart.map((item) => ({
    item,
    lineTotal: (item.price || 0) * item.qty,
  }));

  const total = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  return (
    <>
      <div className="container">
        <h2 className="section-title">Giỏ hàng của bạn</h2>
      </div>

      <div className="cart-list">
        {!ready ? null : lines.length === 0 ? (
          <p className="empty-message">Giỏ hàng của bạn đang trống.</p>
        ) : (
          lines.map(({ item, lineTotal }) => (
            <div className="cart-item" key={item.key}>
              <img
                className="cart-item__img"
                src={item.image}
                alt={item.name}
              />
              <div className="cart-item__body">
                <div className="cart-item__name">{item.name}</div>
                {(item.color || item.size) && (
                  <div className="cart-item__variant">
                    {[item.color, item.size].filter(Boolean).join(" / ")}
                  </div>
                )}
                <div className="cart-item__price">{formatPrice(lineTotal)}</div>
                <div className="cart-item__row">
                  <div className="cart-item__qty">
                    <button
                      type="button"
                      onClick={() => changeQty(item.key, item.qty - 1)}
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.key, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() => remove(item.key)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {ready && lines.length > 0 && (
        <div className="cart-summary">
          <div className="cart-summary__row">
            <span>Tổng cộng</span>
            <span className="cart-summary__total">{formatPrice(total)}</span>
          </div>

          <div className="container">
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
          </div>
        </div>
      )}
    </>
  );
}
