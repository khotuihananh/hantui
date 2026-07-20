// config.js - Cấu hình chung của shop (dễ chỉnh sửa 1 chỗ).

// Đổi domain thật khi deploy để SEO/sitemap/Open Graph trỏ đúng.
export const SITE_URL = "https://tuixachhananh.com";

export const SITE_NAME = "Túi Xách Hân Anh";
export const SITE_DESCRIPTION =
  "Shop Túi Xách Hân Anh - Túi xách đẹp, bền, giá tốt mỗi ngày. Giao hàng toàn quốc.";

// Thông tin liên hệ (hiển thị ở footer + dùng cho nút đặt đơn).
export const CONTACT = {
  address: "Lê Trọng Tấn, Hà Đông, Hà Nội",
  hotline: "0906065019",
  hotlineDisplay: "0906.065.019",
  openTime: "8:00 - 22:00",
};

// Link liên hệ mua ngay (dùng cho khối "Liên hệ mua ngay" ở trang chi tiết).
// Thay bằng link Facebook / Zalo thật của shop.
export const ORDER_LINKS = {
  // Messenger của shop (m.me/... hoặc facebook.com/...).
  facebook: "https://www.facebook.com/KhoTui.HanAnh",
  // Link Zalo: https://zalo.me/<số điện thoại> hoặc <id zalo>.
  zalo: "https://zalo.me/0822235999",
  messenger: "https://m.me/hanthetuixach",
};

// Danh mục sản phẩm (slug -> tên hiển thị).
export const PRODUCT_CATEGORIES = {
  "tui-xach": "Túi xách",
  "quan-ao": "Quần áo",
  "giay-dep": "Giày dép",
  "phu-kien": "Phụ kiện",
};
