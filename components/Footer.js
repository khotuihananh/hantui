// Footer.js - Footer tĩnh, khớp bản gốc (mockup/Goc): mobile 1 cột thông tin,
// desktop chia 3 cột (thông tin / liên kết nhanh / kết nối).

import Link from "next/link";
import { SITE_NAME, CONTACT, ORDER_LINKS } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="footer" id="lienhe">
      <div className="footer__inner">
        {/* Cột 1: thông tin cửa hàng (hiển thị trên cả mobile & desktop) */}
        <div className="footer__col footer__col--main">
          <div className="footer__title">{SITE_NAME}</div>

          <p className="footer__text">Địa chỉ: {CONTACT.address}</p>

          <p className="footer__text">
            Hotline:{" "}
            <a href={`tel:${CONTACT.hotline}`}> {CONTACT.hotlineDisplay} </a>
          </p>

          <p className="footer__text">Thời gian mở cửa: {CONTACT.openTime}</p>
        </div>

        {/* Cột 2 & 3: chỉ hiển thị trên desktop (min-width: 1024px) */}
        <div className="footer__col footer__col--links">
          <div className="footer__title">Liên kết nhanh</div>
          <ul className="footer__links">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li>
              <Link href="/san-pham">Sản phẩm</Link>
            </li>
            <li>
              <Link href="/gio-hang">Giỏ hàng</Link>
            </li>
          </ul>
        </div>

        <div className="footer__col footer__col--social">
          <div className="footer__title">Kết nối với chúng tôi</div>
          <div className="footer__social">
            <a href={`tel:${CONTACT.hotline}`} aria-label="Gọi điện">
              <img src="/img/icons/phone.png" alt="" />
            </a>
            <a href={ORDER_LINKS.zalo} aria-label="zalo">
              <img src="/img/icons/zalo.png" alt="" />
            </a>
            <a href={ORDER_LINKS.facebook} aria-label="facebook">
              <img src="/img/icons/facebook.png" alt="" />
            </a>
          </div>
        </div>

        <div className="footer__copy">
          © 2026 Shop {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
