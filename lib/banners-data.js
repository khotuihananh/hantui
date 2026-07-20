// banners-data.js - Dữ liệu Banner TẠM THỜI (dùng khi chưa cấu hình Supabase
// hoặc bảng "banners" chưa có dữ liệu/lỗi truy vấn), để trang chủ không bao
// giờ bị trống banner. Giữ đúng ảnh gốc đã có sẵn trong public/img/banner.

export const banners = [
  {
    id: "local-1",
    title: "Shop Túi Xách",
    subtitle: "Đẹp - Bền - Giá tốt mỗi ngày",
    image: "/img/banner/baner.png",
    button_text: "",
    button_link: "",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "local-2",
    title: "",
    subtitle: "",
    image: "/img/banner/baner2.png",
    button_text: "",
    button_link: "",
    is_active: true,
    sort_order: 2,
  },
];

export function getActiveBanners() {
  return banners.filter((b) => b.is_active);
}

export function getAllBanners() {
  return banners;
}
