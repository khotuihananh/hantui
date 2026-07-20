// products-data.js - Dữ liệu sản phẩm TẠM THỜI (bước 1-4).
// Ở bước 5 sẽ thay bằng truy vấn Supabase; giao diện và các trang giữ nguyên.
// Slug dùng cho URL sạch: /san-pham/tui-xach-nu-dor

export const products = [
  // {
  //   id: 1,
  //   slug: "tui-xach-nu-dor",
  //   name: "Túi xách nữ Dor",
  //   price: 50000,
  //   category: "tui-xach",
  //   images: [
  //     "/img/products/1/a (1).jpg",
  //     "/img/products/1/a (2).jpg",
  //     "/img/products/1/a (3).jpg",
  //     "/img/products/1/a (4).jpg",
  //     "/img/products/1/a (5).jpg",
  //     "/img/products/1/a (6).jpg",
  //     "/img/products/1/a (7).jpg",
  //   ],
  //   description:
  //     "Túi xách nữ Dor thiết kế trẻ trung, năng động, phù hợp đi học, đi làm hay dạo phố. Chất liệu bền đẹp, form dáng gọn nhẹ, dễ phối với nhiều trang phục.",
  // },
  // {
  //   id: 2,
  //   slug: "tui-xach-mini",
  //   name: "Túi xách mini",
  //   price: 60000,
  //   category: "giay-dep",
  //   images: [
  //     "/img/products/2/1 (1).jpg",
  //     "/img/products/2/1 (2).jpg",
  //     "/img/products/2/1 (3).jpg",
  //     "/img/products/2/1 (4).jpg",
  //     "/img/products/2/1 (5).jpg",
  //     "/img/products/2/1 (6).jpg",
  //   ],
  //   description:
  //     "Túi xách mini nhỏ gọn, tiện lợi mang theo hằng ngày. Thiết kế đơn giản, tinh tế, thích hợp đựng những vật dụng cá nhân cần thiết.",
  // },
  // {
  //   id: 3,
  //   slug: "tui-xach-mau-den",
  //   name: "Túi xách màu đen",
  //   price: 60000,
  //   category: "quan-ao",
  //   images: [
  //     "/img/products/3/1 (1).jpg",
  //     "/img/products/3/1 (2).jpg",
  //     "/img/products/3/1 (3).jpg",
  //     "/img/products/3/1 (4).jpg",
  //   ],
  //   description:
  //     "Túi xách màu đen basic, dễ phối đồ, phù hợp mọi phong cách từ thanh lịch đến năng động. Màu sắc trung tính, bền theo thời gian.",
  // },
  // {
  //   id: 4,
  //   slug: "tui-xach-do",
  //   name: "Túi xách đỏ",
  //   price: 60000,
  //   category: "phu-kien",
  //   images: [
  //     "/img/products/4/1 (1).jpg",
  //     "/img/products/4/1 (2).jpg",
  //     "/img/products/4/1 (3).jpg",
  //     "/img/products/4/1 (4).jpg",
  //     "/img/products/4/1 (5).jpg",
  //     "/img/products/4/1 (6).jpg",
  //   ],
  //   description:
  //     "Túi xách đỏ nổi bật, ghi điểm nhấn cho tổng thể trang phục. Thiết kế thời trang, chất liệu chắc chắn, tiện dụng cho mọi hoạt động trong ngày.",
  // },
];

// ---- Các hàm truy vấn (bước 5 sẽ thay ruột bằng Supabase, giữ nguyên chữ ký) ----

// Đảm bảo mọi sản phẩm (kể cả dữ liệu tạm cũ, chưa có phân loại) đều có đủ
// field colors/sizes/variants để component dùng chung không bị lỗi.
function withVariantDefaults(p) {
  if (!p) return p;
  return {
    colors: [],
    sizes: [],
    variants: [],
    ...p,
  };
}

export function getAllProducts() {
  return products.map(withVariantDefaults);
}

export function getProductBySlug(slug) {
  const p = products.find((p) => p.slug === slug) || null;
  return withVariantDefaults(p);
}

export function getProductById(id) {
  const p = products.find((p) => p.id === Number(id)) || null;
  return withVariantDefaults(p);
}

export function getProductsByCategory(category) {
  const list = category ? products.filter((p) => p.category === category) : products;
  return list.map(withVariantDefaults);
}
