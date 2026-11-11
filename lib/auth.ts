import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  nickname: string;
  createdAt: string | null;
};

/**
 * 지금 로그인한 사용자 정보 (로그인 안 했으면 null).
 * 로그인 확인 + 프로필 조회를 한곳에 모아두면 여러 화면에서 재사용하기 편해요.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  // getClaims() 는 토큰 서명까지 검증해요. 서버에서는 getSession() 대신 이걸 쓰세요.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, created_at")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: claims.email ?? "",
    nickname: profile?.nickname ?? "이웃",
    createdAt: profile?.created_at ?? null,
  };
}
