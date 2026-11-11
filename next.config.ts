import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // next/image 로 보여줄 수 있는 외부 사진 주소: 우리 Supabase Storage 의 판매글 사진 버킷만 허용해요.
    remotePatterns: [
      new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/goguma-products/**`),
    ],
  },
  partialPrefetching: true,
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
