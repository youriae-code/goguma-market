import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import GogumaIcon from "@/components/GogumaIcon";

export const metadata: Metadata = { title: "내 정보 | 고구마마켓" };

export default function MyPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-[2rem] border-2 border-white bg-white/80 p-8 text-center shadow-soft">
        <GogumaIcon className="mx-auto h-24 w-24" />
        <Suspense fallback={<p className="mt-6 text-muted">내 정보를 불러오는 중… 🍠</p>}>
          <Profile />
        </Suspense>
      </div>
    </div>
  );
}

async function Profile() {
  // proxy 에서도 막지만, 페이지에서도 한 번 더 확인하는 게 안전해요.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <>
      <h1 className="mt-4 font-cute text-3xl text-goguma-dark">{user.nickname}님</h1>
      <dl className="mt-6 space-y-3 text-left">
        <div className="flex justify-between gap-4 rounded-2xl bg-cream px-4 py-3">
          <dt className="shrink-0 text-muted">이메일</dt>
          <dd className="truncate">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4 rounded-2xl bg-cream px-4 py-3">
          <dt className="text-muted">가입일</dt>
          <dd>{joined}</dd>
        </div>
        <div className="flex justify-between gap-4 rounded-2xl bg-cream px-4 py-3">
          <dt className="text-muted">매너온도</dt>
          <dd className="font-cute text-[#e8795a]">36.5℃ 🔥</dd>
        </div>
      </dl>
      <form action={logout} className="mt-6">
        <button className="w-full cursor-pointer rounded-2xl border-2 border-goguma/40 py-3 font-cute text-goguma-dark transition hover:border-goguma hover:bg-cream-deep">
          로그아웃
        </button>
      </form>
    </>
  );
}
