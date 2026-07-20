// admin/page.js - Trang quản trị. Server component: kiểm tra đăng nhập trước,
// chưa đăng nhập -> form đăng nhập; đã đăng nhập -> bảng thêm/sửa/xóa sản phẩm.

import "./admin.css";
import { isLoggedIn } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getAllProducts } from "@/lib/products";
import { loginAction, logoutAction } from "./actions";
import LoginForm from "./LoginForm";
import ProductForm from "./ProductForm";
import ProductRow from "./ProductRow";

export const metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

// Không cache trang admin (luôn hiển thị dữ liệu mới nhất).
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return <LoginForm action={loginAction} />;
  }

  const products = await getAllProducts();

  return (
    <div className="admin-wrap">
      <div className="admin-head">
        <h1>Quản lý sản phẩm</h1>
        <div className="admin-actions">
          <a href="/admin/banner" className="admin-btn admin-btn--ghost">
            Quản lý Banner
          </a>
          <form action={logoutAction}>
            <button className="admin-btn admin-btn--ghost" type="submit">
              Đăng xuất
            </button>
          </form>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="admin-warning">
          Chưa cấu hình Supabase. Bạn đang xem dữ liệu tạm và{" "}
          <strong>chưa thể lưu thay đổi</strong>. Hãy tạo file{" "}
          <code>.env.local</code> với khóa Supabase rồi khởi động lại để bật
          thêm/sửa/xóa.
        </div>
      )}

      <ProductForm />

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((p) => <ProductRow key={p.id} product={p} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
