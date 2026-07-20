// utils.js - Hàm tiện ích dùng chung (giữ nguyên logic từ bản SPA cũ).

// Định dạng giá kiểu Việt Nam: 50000 -> "50.000đ".
export function formatPrice(number) {
  return Number(number).toLocaleString("vi-VN") + "đ";
}

// Chuẩn hóa tiếng Việt để tìm kiếm không dấu (giữ nguyên logic search.js cũ).
export function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

// Tạo slug từ tên sản phẩm (dùng cho URL sạch): "Túi xách đỏ" -> "tui-xach-do".
export function slugify(value) {
  return normalizeSearchText(value)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Kiểm tra 1 chuỗi có phải link ảnh hợp lệ để dùng với next/image hay không:
// phải là đường dẫn tuyệt đối bắt đầu bằng "/" (ảnh trong /public) hoặc URL
// đầy đủ http(s)://... Dùng để chặn việc lỡ dán nhầm văn bản (không phải
// link ảnh) vào ô "dán link ảnh" ở trang admin.
export function isValidImageSrc(value) {
  if (typeof value !== "string") return false;
  const s = value.trim();
  if (!s) return false;
  if (s.startsWith("/")) return true;
  return /^https?:\/\/\S+$/i.test(s);
}
