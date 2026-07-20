"use client";

// BannerSlider.js - Banner slideshow tự chuyển ảnh (khớp bản gốc mockup/Goc).
// Dữ liệu banner giờ lấy từ Supabase (bảng "banners"), được app/page.js
// (Server Component) fetch sẵn và truyền vào qua prop "banners" - component
// này không tự fetch để tránh gọi API thừa.
// Nếu "banners" rỗng (chưa cấu hình DB hoặc chưa có banner nào), dùng dữ liệu
// dự phòng cục bộ để không bao giờ vỡ giao diện.

import { useEffect, useState } from "react";
import { getActiveBanners as getFallbackBanners } from "@/lib/banners-data";

export default function BannerSlider({ banners }) {
  const list =
    Array.isArray(banners) && banners.length > 0
      ? banners
      : getFallbackBanners();

  const slides = list.map((b) => ({
    src: b.image,
    alt: b.title || "Banner",
  }));

  // Tiêu đề/mô tả tổng quát của banner: lấy từ banner đầu tiên (theo
  // sort_order), vì giao diện gốc chỉ có MỘT khối tiêu đề chung cho cả
  // slideshow (không có tiêu đề riêng cho từng ảnh).
  const overlayTitle = list[0]?.title || "Shop Túi Xách";
  const overlaySubtitle = list[0]?.subtitle || "Đẹp - Bền - Giá tốt mỗi ngày";

  const [current, setCurrent] = useState(0);

  // Tự chuyển ảnh mỗi 3 giây. Chỉ chạy khi có nhiều hơn 1 ảnh.
  useEffect(() => {
    if (slides.length <= 1) return;
    setCurrent(0);
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="banner banner-slider" id="homeBanner">
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`banner-slide${index === current ? " is-active" : ""}`}
        >
          <img src={slide.src} alt={slide.alt} />
        </div>
      ))}
      <div className="banner__overlay">
        <h1 className="banner__title">{overlayTitle}</h1>
        <p className="banner__subtitle">{overlaySubtitle}</p>
      </div>
    </section>
  );
}
