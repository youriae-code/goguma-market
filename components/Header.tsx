import { Suspense } from "react";
import Link from "next/link";
import GogumaIcon from "./GogumaIcon";
import UserMenu from "./UserMenu";

/**
 * 헤더의 로고 부분은 모든 사람에게 똑같으니 미리 만들어 두고(정적),
 * 로그인 상태에 따라 달라지는 메뉴(UserMenu)만 <Suspense> 안에서 요청 때마다 그려요.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-peach/70 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="group flex shrink-0 items-center gap-1.5 sm:gap-2">
          <GogumaIcon className="h-8 w-8 transition-transform group-hover:animate-[wiggle_0.5s_ease-in-out_infinite] sm:h-9 sm:w-9" />
          <span className="font-cute text-xl whitespace-nowrap text-goguma-dark sm:text-2xl">고구마마켓</span>
        </Link>

        <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-full bg-cream-deep" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
