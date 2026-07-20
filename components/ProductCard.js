// ProductCard.js - Thẻ sản phẩm trong grid. Khớp đúng class của bản SPA cũ.
// Toàn thẻ là link tới trang chi tiết (URL sạch theo slug).
// Ảnh dùng next/image ở chế độ `fill` bên trong khung vuông cố định
// (.product-card__img-wrap) để crop 1:1 bằng object-fit: cover mà không
// méo ảnh và không gây layout shift, dù ảnh nguồn là ảnh dọc/ngang/vuông.

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }) {
  const src = product.images && product.images[0];

  return (
    <Link href={`/san-pham/${product.slug}`} className="product-card">
      <div className="product-card__img-wrap">
        {src ? (
          <Image
            className="product-card__img"
            src={src}
            alt={product.name}
            fill
            sizes="(min-width: 1440px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div
            className="product-card__img"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f2f2f2",
              color: "#999",
              fontSize: 13,
            }}
          >
            Chưa có ảnh
          </div>
        )}
      </div>
      <div className="product-card__body">
        <div className="product-card__name">{product.name}</div>
        <div className="product-card__price">{formatPrice(product.price)}</div>
        <button className="product-card__btn" type="button">
          Xem chi tiết
        </button>
      </div>
    </Link>
  );
}
