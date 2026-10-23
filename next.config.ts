import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Yükleme action'ları için (dosyalar en fazla 3,5 MB; Vercel gövde sınırı 4,5 MB).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // Taahhütname PDF'i için çalışma zamanında okunan dosyalar.
  outputFileTracingIncludes: {
    "/api/taahhutname": ["./assets/fonts/**/*", "./docs/taahhutname.md"],
  },
  partialPrefetching: true,
  poweredByHeader: false,
  // Güvenlik başlıkları. CSP bilerek yok: iyzico ödeme formu kendi betik ve çerçevelerini yükler; sandbox
  // denemesi yapılmadan sıkı bir CSP formu bozabilir (docs/CANLIYA-GECIS.md).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
