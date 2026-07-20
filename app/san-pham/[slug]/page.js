// san-pham/[slug]/page.js - Trang chi tiết sản phẩm (server component).
// - generateMetadata: title/description/Open Graph riêng từng sản phẩm
//   -> khi share Facebook/Zalo hiện đúng ảnh + tên, và Google index tốt.
// - JSON-LD schema.org/Product: giúp Google hiện giá/tình trạng trên kết quả.
// - generateStaticParams: tạo sẵn trang tĩnh cho từng sản phẩm.

import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import { SITE_URL, SITE_NAME } from "@/lib/config";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Không tìm thấy sản phẩm" };
  }

  const url = `${SITE_URL}/san-pham/${product.slug}`;
  const image = `${SITE_URL}${product.images[0]}`;
  const description = product.description;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${product.name} - ${SITE_NAME}`,
      description,
      url,
      images: [{ url: image }],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const all = await getAllProducts();
  const related = all.filter((p) => p.id !== product.id);

  // Dữ liệu có cấu trúc cho Google (Rich Results).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `${SITE_URL}${img}`),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/san-pham/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container">
        <Link href="/san-pham" className="back-link">
          ← Quay lại danh sách
        </Link>
      </div>

      <div id="productDetail">
        <ProductDetail product={product} />
      </div>

      <section className="container">
        <h2 className="section-title">Sản phẩm khác</h2>
        <div className="product-grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
