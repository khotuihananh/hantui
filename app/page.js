// page.js - Trang chủ: banner + danh sách sản phẩm nổi bật.
// Render phía server (tốt cho SEO): HTML sản phẩm có sẵn khi Google đọc.

import ProductCard from "@/components/ProductCard";
import BannerSlider from "@/components/BannerSlider";
import { getAllProducts } from "@/lib/products";
import { getActiveBanners } from "@/lib/banners";

export default async function HomePage() {
  const [products, banners] = await Promise.all([
    getAllProducts(),
    getActiveBanners(),
  ]);

  return (
    <>
      {/* BANNER (slideshow tự chuyển ảnh, dữ liệu lấy từ Supabase) */}
      <BannerSlider banners={banners} />

      {/* DANH SÁCH SẢN PHẨM */}
      <section className="container">
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
