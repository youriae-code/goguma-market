import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * 인증 메일의 링크를 누르면 도착하는 곳.
 * - ?code=...            (기본 메일 템플릿, PKCE 방식)
 * - ?token_hash=&type=   (메일 템플릿을 직접 바꿨을 때)
 * 둘 다 처리해서 로그인 상태로 만든 뒤 홈으로 보내요.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/?welcome=1`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}/?welcome=1`);
  }

  return NextResponse.redirect(`${origin}/login?error=confirm`);
}
