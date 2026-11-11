"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** 폼 아래에 보여줄 상태 (에러 또는 안내 메시지) */
export type AuthFormState = {
  error?: string;
  message?: string;
  /** 다시 그릴 때 입력값을 유지하기 위해 돌려줘요 (비밀번호는 제외) */
  values?: { email?: string; nickname?: string };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Supabase 에러 코드를 친절한 한국어로 바꿔요 */
function toKoreanMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "이메일 또는 비밀번호가 맞지 않아요 🥲";
    case "email_not_confirmed":
      return "아직 이메일 인증을 안 하셨어요. 메일함을 확인해 주세요 📬";
    case "user_already_exists":
    case "email_exists":
      return "이미 가입된 이메일이에요. 로그인해 주세요!";
    case "weak_password":
      return "비밀번호가 너무 약해요. 더 길고 복잡하게 만들어 주세요.";
    case "email_address_invalid":
      return "사용할 수 없는 이메일 주소예요.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요 ⏳";
    case "signup_disabled":
      return "지금은 회원가입을 받지 않고 있어요.";
    default:
      return `앗, 문제가 생겼어요: ${error.message}`;
  }
}

/** 로그인 후 이동할 주소. 외부 사이트로 튕겨나가지 않도록 내부 경로만 허용해요. */
function safeNext(next: FormDataEntryValue | null) {
  const path = typeof next === "string" ? next : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

// ---------------- 회원가입 ----------------
export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  const values = { email, nickname };

  // 1) 입력값 검사
  if (nickname.length < 2 || nickname.length > 12) {
    return { error: "닉네임은 2~12글자로 지어주세요.", values };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "이메일 형식이 올바르지 않아요.", values };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 해요.", values };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호 확인이 일치하지 않아요.", values };
  }

  const supabase = await createClient();

  // 2) 닉네임 중복 확인 (profiles 는 누구나 조회 가능)
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("nickname", nickname)
    .maybeSingle();
  if (taken) {
    return { error: "이미 누군가 쓰고 있는 닉네임이에요. 다른 이름은 어때요?", values };
  }

  // 3) 가입 — nickname 은 user_metadata 로 넘기면 DB 트리거가 profiles 에 저장해요.
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return { error: toKoreanMessage(error), values };
  }

  // 이메일 인증이 켜져 있을 때, 이미 가입된 이메일이면 identities 가 빈 배열로 와요.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "이미 가입된 이메일이에요. 로그인해 주세요!", values };
  }

  // 4-a) 이메일 인증이 꺼져 있으면 바로 로그인 상태가 돼요.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/?welcome=1");
  }

  // 4-b) 이메일 인증이 켜져 있으면 메일함 확인 안내
  return {
    message: `${email} 로 인증 메일을 보냈어요! 메일의 링크를 누르면 가입이 완료돼요 📬`,
  };
}

// ---------------- 로그인 ----------------
export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요.", values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: toKoreanMessage(error), values };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

// ---------------- 로그아웃 ----------------
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
