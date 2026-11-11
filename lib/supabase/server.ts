import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * 서버(Server Component, Server Action, Route Handler)에서 쓰는 Supabase 클라이언트.
 * 로그인 정보는 쿠키에 저장되므로 요청마다 새로 만들어야 해요.
 */
export async function createClient() {
  // Supabase 는 토큰 만료 확인에 현재 시각(Date.now)을 써요.
  // connection() 으로 "실제 요청이 들어왔을 때만 실행"하도록 알려줘야
  // Next.js 가 미리 그려두기(prerender) 단계에서 에러를 내지 않아요.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component 에서는 쿠키를 쓸 수 없어요.
            // 토큰 갱신은 proxy.ts 가 대신 해주므로 무시해도 됩니다.
          }
        },
      },
    },
  );
}
