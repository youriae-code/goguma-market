import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";

/** 로그인 여부에 따라 [로그인/회원가입] 또는 [닉네임/로그아웃]을 보여줘요 */
export default async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <nav className="flex items-center gap-1 text-sm whitespace-nowrap sm:gap-2">
        <Link href="/login" className="rounded-full px-3 py-2 font-cute text-ink transition hover:bg-cream-deep sm:px-4">
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-goguma px-3 py-2 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none sm:px-4"
        >
          회원가입
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm whitespace-nowrap sm:gap-2">
      <Link
        href="/products/new"
        className="rounded-full bg-goguma px-3 py-2 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none sm:px-4"
      >
        ✏️<span className="hidden sm:inline"> 글쓰기</span>
      </Link>
      <Link
        href="/mypage"
        aria-label="내 정보"
        className="max-w-44 truncate rounded-full bg-lavender px-3 py-2 font-cute text-goguma-dark transition hover:bg-goguma hover:text-white sm:px-4"
      >
        {/* 휴대폰처럼 좁은 화면에서는 닉네임을 숨기고 🍠 만 보여줘요 */}
        <span className="hidden sm:inline">{user.nickname}님 </span>🍠
      </Link>
      <form action={logout}>
        <button className="cursor-pointer rounded-full border-2 border-goguma/40 bg-white px-3 py-1.5 font-cute text-goguma-dark transition hover:border-goguma hover:bg-cream-deep sm:px-4">
          로그아웃
        </button>
      </form>
    </nav>
  );
}
