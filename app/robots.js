// robots.js - Tự sinh robots.txt. Cho phép Google thu thập toàn site,
// chặn trang admin và giỏ hàng. Truy cập tại /robots.txt.

import { SITE_URL } from "@/lib/config";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/gio-hang"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
