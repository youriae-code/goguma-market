import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadChatCount } from "@/lib/chat-queries";

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

  // 안 읽은 채팅 메시지 수 (배지로 보여줘요)
  const unread = await getUnreadChatCount(user.id);

  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm whitespace-nowrap sm:gap-2">
      <Link
        href="/products/new"
        className="rounded-full bg-goguma px-3 py-2 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none sm:px-4"
      >
        ✏️<span className="hidden sm:inline"> 글쓰기</span>
      </Link>
      <Link
        href="/chats"
        aria-label={unread > 0 ? `채팅 (안 읽은 메시지 ${unread}개)` : "채팅"}
        className="relative rounded-full border-2 border-peach bg-white px-3 py-1.5 font-cute text-goguma-dark transition hover:bg-cream-deep sm:px-4"
      >
        💬<span className="hidden sm:inline"> 채팅</span>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[11px] text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
      <Link
        href="/mypage"
        aria-label="내 정보"
        className="max-w-44 truncate rounded-full bg-lavender px-3 py-2 font-cute text-goguma-dark transition hover:bg-goguma hover:text-white sm:px-4"
      >
        {/* 휴대폰처럼 좁은 화면에서는 닉네임을 숨기고 🍠 만 보여줘요 */}
        <span className="hidden sm:inline">{user.nickname}님 </span>🍠
      </Link>
      {/* 휴대폰에서는 자리가 좁아서 숨겨요. (마이페이지에서 로그아웃할 수 있어요) */}
      <form action={logout} className="hidden sm:block">
        <button className="cursor-pointer rounded-full border-2 border-goguma/40 bg-white px-3 py-1.5 font-cute text-goguma-dark transition hover:border-goguma hover:bg-cream-deep sm:px-4">
          로그아웃
        </button>
      </form>
    </nav>
  );
}
