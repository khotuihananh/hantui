/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Mặc định Next.js chỉ cho body 1MB, chặn upload ảnh lớn.
      // Nâng lên 15MB để đủ chỗ cho vài ảnh sản phẩm mỗi lần.
      bodySizeLimit: "15mb",
    },
  },
  images: {
    // Cho phép nạp ảnh từ Supabase Storage (bổ sung domain khi có project).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
