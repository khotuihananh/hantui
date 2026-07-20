// layout.js - Layout gốc: Header + Footer dùng chung cho mọi trang.

import "./styles/style.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/home.css";
import "./styles/product.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Túi xách đẹp, bền, giá tốt`,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "vi_VN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <main id="app">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
