"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthFormState } from "@/app/auth/actions";
import FormField from "@/components/FormField";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signup, {});

  // 인증 메일을 보냈다면 폼 대신 안내만 보여줘요.
  if (state.message) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-5xl">💌</p>
        <FormMessage message={state.message} />
        <Link
          href="/login"
          className="inline-block rounded-2xl bg-goguma px-6 py-3 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormField
        label="닉네임"
        name="nickname"
        placeholder="예) 달콤한고구마"
        minLength={2}
        maxLength={12}
        defaultValue={state.values?.nickname}
        hint="이웃들에게 보여질 이름이에요 (2~12자)"
        required
      />
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
        autoComplete="new-password"
        placeholder="6자 이상"
        minLength={6}
        required
      />
      <FormField
        label="비밀번호 확인"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        placeholder="한 번 더 입력해 주세요"
        minLength={6}
        required
      />
      <FormMessage error={state.error} />
      <SubmitButton pending={pending} pendingText="가입하는 중…">
        가입하기 🍠
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        이미 회원이신가요?{" "}
        <Link href="/login" className="font-cute text-goguma underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
