"use client";

// Header.js - Header cố định + menu (mobile: trượt / desktop: ngang) + tìm kiếm.
// Khớp đúng HTML/class của bản gốc (mockup/Goc), chỉ đổi link hash -> URL sạch
// và dùng state của React thay cho thao tác class thủ công.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCartCount } from "@/lib/cart";
import { CONTACT, ORDER_LINKS } from "@/lib/config";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // Cập nhật badge giỏ hàng khi tải trang và mỗi khi giỏ thay đổi.
  useEffect(() => {
    const update = () => setCartCount(getCartCount());
    update();
    window.addEventListener("cart-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cart-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  // Khóa cuộn trang khi menu mở (giống class no-scroll cũ).
  useEffect(() => {
    document.body.classList.toggle("no-scroll", menuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [menuOpen]);

  // Đóng menu/search khi nhấn Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    const q = keyword.trim();
    router.push(q ? `/san-pham?q=${encodeURIComponent(q)}` : "/san-pham");
    setSearchOpen(false);
  }

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header__inner">
          <button
            id="menuBtn"
            className="header__icon-btn"
            type="button"
            aria-label="Mở menu"
            onClick={() => setMenuOpen(true)}
          >
            <img src="/img/icons/menu.png" alt="" />
          </button>

          <Link href="/" className="header__logo">
            <img src="/img/logo/logo.png" alt="Logo shop" />
          </Link>

          {/* Wrapper căn giữa menu ngang + ô tìm kiếm trên desktop
              (display:contents trên mobile nên không đổi gì) */}
          <div className="header__center">
            {/* MENU: mobile là menu trượt, desktop là menu ngang */}
            <nav className={`nav-menu${menuOpen ? " is-open" : ""}`}>
              <div className="nav-menu__top">
                <img src="/img/logo/logo.png" alt="Logo shop" />
              </div>
              <ul className="nav-menu__list">
                <li>
                  <Link href="/" onClick={() => setMenuOpen(false)}>
                    Trang chủ
                  </Link>
                </li>
                <li className="nav-menu__item">
                  <Link href="/san-pham" onClick={() => setMenuOpen(false)}>
                    Sản phẩm
                  </Link>
                  <ul className="nav-menu__sublist">
                    <li>
                      <Link
                        href="/san-pham?category=tui-xach"
                        onClick={() => setMenuOpen(false)}
                      >
                        Túi xách
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/san-pham?category=quan-ao"
                        onClick={() => setMenuOpen(false)}
                      >
                        Quần áo
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/san-pham?category=giay-dep"
                        onClick={() => setMenuOpen(false)}
                      >
                        Giày dép
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/san-pham?category=phu-kien"
                        onClick={() => setMenuOpen(false)}
                      >
                        Phụ kiện
                      </Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link href="/gio-hang" onClick={() => setMenuOpen(false)}>
                    Giỏ hàng
                  </Link>
                </li>
                <li>
                  <a href="#lienhe" onClick={() => setMenuOpen(false)}>
                    Liên hệ
                  </a>
                </li>
              </ul>
            </nav>

            {/* Thanh tìm kiếm: mobile ẩn (mở khi bấm icon), desktop luôn hiện */}
            <form
              id="searchForm"
              className={`header-search${searchOpen ? " is-open" : ""}`}
              role="search"
              onSubmit={submitSearch}
            >
              <label className="sr-only" htmlFor="searchInput">
                Tìm kiếm sản phẩm
              </label>
              <input
                id="searchInput"
                className="header-search__input"
                type="search"
                placeholder="Tìm kiếm sản phẩm"
                autoComplete="off"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button
                className="header-search__btn"
                type="submit"
                aria-label="Tìm kiếm"
              >
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0a7 7 0 0114 0z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                id="searchCloseBtn"
                className="header-search__close"
                type="button"
                aria-label="Đóng tìm kiếm"
                onClick={() => {
                  setKeyword("");
                  setSearchOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </form>
          </div>
          <div className="header__actions">
            <button
              id="searchToggleBtn"
              className="header__icon-btn"
              type="button"
              aria-label="Tìm kiếm"
              aria-expanded={searchOpen}
              aria-controls="searchForm"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <img src="/img/icons/Search.png" alt="" />
            </button>
            <Link
              href="/gio-hang"
              className="header__icon-btn header__cart"
              aria-label="Giỏ hàng"
            >
              <img src="/img/icons/gio hang.png" alt="" />
              <span
                className="header__cart-badge"
                style={{ display: cartCount > 0 ? "flex" : "none" }}
              >
                {cartCount}
              </span>
            </Link>
            {/* ĐƯỜNG PHÂN CÁCH DỌC ĐƯỢC THÊM VÀO ĐÂY */}
            <span className="header__divider"></span>

            <a
              href={`tel:${CONTACT.hotline}`}
              className="header__icon-btn"
              aria-label="Gọi điện"
            >
              <img src="/img/icons/phone.png" alt="" />
            </a>
            <a
              href={ORDER_LINKS.facebook}
              className="header__icon-btn"
              aria-label="facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/img/icons/facebook.png" alt="" />
            </a>
            <a
              href={ORDER_LINKS.messenger}
              className="header__icon-btn"
              aria-label="messenger"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/img/icons/messenger.png" alt="" />
            </a>
            <a
              href={ORDER_LINKS.zalo}
              className="header__icon-btn"
              aria-label="zalo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/img/icons/zalo.png" alt="" />
            </a>
          </div>
        </div>
      </header>

      {/* Lớp phủ tối khi mở menu */}
      <div
        id="overlay"
        className={`overlay${menuOpen ? " is-visible" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
    </>
  );
}
