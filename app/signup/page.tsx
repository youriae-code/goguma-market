import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import SignupForm from "./SignupForm";

export const metadata: Metadata = { title: "회원가입 | 고구마마켓" };

export default function SignupPage() {
  return (
    <AuthCard title="고구마마켓에 어서 오세요!" subtitle="간단한 가입으로 우리 동네 이웃이 되어주세요">
      <SignupForm />
    </AuthCard>
  );
}
