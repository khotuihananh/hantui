// san-pham/page.js - Danh sách sản phẩm, lọc theo ?category= và tìm kiếm ?q=.
// Đọc tham số từ URL phía server nên nội dung có sẵn cho Google.

import ProductCard from "@/components/ProductCard";
import { getAllProducts, getProductsByCategory } from "@/lib/products";
import { normalizeSearchText, formatPrice } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/config";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || "";
  const categoryName = PRODUCT_CATEGORIES[category] || "";
  const title = categoryName || "Tất cả sản phẩm";
  return {
    title,
    description: `${title} tại shop. Túi xách đẹp, bền, giá tốt, giao hàng toàn quốc.`,
  };
}

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || "";
  const keyword = (sp?.q || "").trim();

  const categoryName = PRODUCT_CATEGORIES[category] || "";
  const title = categoryName || "Tất cả sản phẩm";

  // Lọc theo danh mục trước, rồi lọc theo từ khóa (không dấu) - giữ logic cũ.
  let list = category
    ? await getProductsByCategory(category)
    : await getAllProducts();

  if (keyword) {
    const nk = normalizeSearchText(keyword);
    list = list.filter((product) => {
      const searchable = normalizeSearchText(
        `${product.name} ${product.description} ${product.price} ${formatPrice(
          product.price,
        )}`,
      );
      return searchable.includes(nk);
    });
  }

  return (
    <section className="container">
      <h2 className="section-title">{title}</h2>
      <div className="product-grid">
        {list.length === 0 ? (
          <p className="empty-message">
            {keyword
              ? `Không tìm thấy sản phẩm phù hợp với "${keyword}".`
              : "Hiện chưa có sản phẩm nào."}
          </p>
        ) : (
          list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
}
