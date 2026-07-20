// sitemap.js - Tự sinh sitemap.xml để Google biết mọi trang cần index.
// Truy cập tại /sitemap.xml.

import { getAllProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/config";

export default async function sitemap() {
  const products = await getAllProducts();

  const productUrls = products.map((p) => ({
    url: `${SITE_URL}/san-pham/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/san-pham`, changeFrequency: "daily", priority: 0.9 },
    ...productUrls,
  ];
}
