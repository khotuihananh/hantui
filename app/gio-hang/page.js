// gio-hang/page.js - Trang giỏ hàng. Không cần SEO nên chặn index,
// phần hiển thị nằm trong CartView (client, đọc localStorage).

import CartView from "@/components/CartView";

export const metadata = {
  title: "Giỏ hàng",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
