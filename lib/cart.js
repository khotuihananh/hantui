// cart.js - Quản lý giỏ hàng bằng localStorage (giữ nguyên logic bản SPA cũ).
//
// Từ khi có phân loại sản phẩm (màu/size), 1 dòng giỏ hàng không còn được
// xác định chỉ bằng productId nữa: 2 sản phẩm cùng ID nhưng khác màu/size
// phải là 2 dòng khác nhau. Vì vậy mỗi item được định danh bằng "key" =
// productId + màu + size, và lưu kèm đầy đủ thông tin hiển thị (name, image,
// price) để trang giỏ hàng không cần tra cứu lại danh sách sản phẩm.

const CART_KEY = "shop_cart";

// Tạo key duy nhất cho 1 dòng giỏ hàng theo productId + màu + size.
function makeKey(productId, color, size) {
  return `${productId}::${color || ""}::${size || ""}`;
}

export function getCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Báo cho các component khác (badge giỏ hàng) cập nhật.
  window.dispatchEvent(new Event("cart-updated"));
}

// item: { productId, name, price, color, size, image, quantity }
export function addToCart(item) {
  const productId = item.productId ?? item.id;
  const color = item.color || null;
  const size = item.size || null;
  const qty = item.quantity ?? item.qty ?? 1;
  const key = makeKey(productId, color, size);

  const cart = getCart();
  const existing = cart.find((line) => line.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      productId,
      name: item.name,
      price: item.price,
      color,
      size,
      image: item.image,
      qty,
    });
  }

  saveCart(cart);
}

export function removeFromCart(key) {
  const cart = getCart().filter((item) => item.key !== key);
  saveCart(cart);
}

export function updateCartItemQty(key, qty) {
  const cart = getCart();
  const item = cart.find((p) => p.key === key);

  if (item) {
    item.qty = qty;
    if (item.qty <= 0) {
      return removeFromCart(key);
    }
  }

  saveCart(cart);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
