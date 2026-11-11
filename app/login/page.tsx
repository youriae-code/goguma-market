import { Suspense } from "react";
import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "로그인 | 고구마마켓" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="다시 만나 반가워요!" subtitle="고구마마켓에 로그인하고 따끈한 거래를 시작해요">
      {/* 주소의 ?next=, ?error= 는 요청마다 달라서 Suspense 안에서 읽어요 */}
      <Suspense fallback={<LoginForm />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LoginFormWithParams({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { next, error } = await searchParams;
  return (
    <LoginForm
      next={typeof next === "string" ? next : undefined}
      initialError={
        error === "confirm" ? "인증 링크가 만료되었거나 올바르지 않아요. 다시 시도해 주세요." : undefined
      }
    />
  );
}
