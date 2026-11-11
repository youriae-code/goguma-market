"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthFormState } from "@/app/auth/actions";
import FormField from "@/components/FormField";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";

export default function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  // useActionState: 서버 액션(login)의 결과(state)와 진행 중 여부(pending)를 관리해요.
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(login, {
    error: initialError,
  });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next ?? "/"} />
      <FormField
        label="이메일"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="goguma@example.com"
        defaultValue={state.values?.email}
        required
      />
      <FormField
        label="비밀번호"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="비밀번호를 입력해 주세요"
        required
      />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton pending={pending} pendingText="로그인 중…">
        로그인
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="font-cute text-goguma underline-offset-4 hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
