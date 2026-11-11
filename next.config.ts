import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 개발 서버를 127.0.0.1 주소로도 열 수 있게 허용해요. (localhost 와 로그인 쿠키가 따로라서,
  // 두 계정으로 동시에 채팅을 테스트할 때 써요. 배포된 사이트에는 영향 없어요)
  allowedDevOrigins: ["127.0.0.1"],
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
