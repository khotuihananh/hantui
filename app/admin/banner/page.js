// admin/banner/page.js - Trang quản trị Banner (module riêng, tách khỏi
// trang quản lý sản phẩm). Server component: kiểm tra đăng nhập trước,
// chưa đăng nhập -> form đăng nhập; đã đăng nhập -> bảng thêm/sửa/xóa banner.

import "../admin.css";
import { isLoggedIn } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getAllBanners } from "@/lib/banners";
import { loginAction } from "../actions";
import LoginForm from "../LoginForm";
import BannerForm from "./BannerForm";
import BannerRow from "./BannerRow";

export const metadata = {
  title: "Quản trị Banner",
  robots: { index: false, follow: false },
};

// Không cache trang admin (luôn hiển thị dữ liệu mới nhất).
export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return <LoginForm action={loginAction} />;
  }

  const banners = await getAllBanners();

  return (
    <div className="admin-wrap">
      <div className="admin-head">
        <h1>Quản lý Banner</h1>
        <a href="/admin" className="admin-btn admin-btn--ghost">
          &larr; Quản lý sản phẩm
        </a>
      </div>

      {!isSupabaseConfigured && (
        <div className="admin-warning">
          Chưa cấu hình Supabase. Bạn đang xem dữ liệu tạm và{" "}
          <strong>chưa thể lưu thay đổi</strong>. Hãy tạo file{" "}
          <code>.env.local</code> với khóa Supabase rồi khởi động lại để bật
          thêm/sửa/xóa.
        </div>
      )}

      <BannerForm />

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tiêu đề</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>
                  Chưa có banner nào.
                </td>
              </tr>
            ) : (
              banners.map((b) => <BannerRow key={b.id} banner={b} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
