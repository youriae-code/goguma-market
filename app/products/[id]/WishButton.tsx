"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { toggleWish } from "./social-actions";

/**
 * 찜하기(♡) 버튼.
 * useOptimistic: 서버 응답을 기다리지 않고 하트를 먼저 바꿔 보여줘요. (실패하면 원래대로 돌아가요)
 *
 * mode
 * - "guest": 로그인 안 함 → 누르면 로그인 페이지로
 * - "mine" : 내 글 → 찜 수만 보여줘요 (내 글은 찜할 수 없어요)
 * - "user" : 찜/취소 가능
 */
export default function WishButton({
  productId,
  wished,
  count,
  mode,
}: {
  productId: number;
  wished: boolean;
  count: number;
  mode: "guest" | "mine" | "user";
}) {
  const [optimistic, toggleOptimistic] = useOptimistic({ wished, count }, (state) => ({
    wished: !state.wished,
    count: state.count + (state.wished ? -1 : 1),
  }));
  const [, startTransition] = useTransition();

  const base =
    "flex shrink-0 items-center gap-1.5 rounded-full border-2 px-4 py-2 font-cute transition";

  if (mode === "mine") {
    return (
      <span className={`${base} border-peach bg-cream text-muted`} title="내 글을 찜한 이웃 수">
        🤍 관심 {count}
      </span>
    );
  }

  if (mode === "guest") {
    return (
      <Link
        href={`/login?next=/products/${productId}`}
        className={`${base} border-rose/50 bg-white text-[#c2415a] hover:bg-rose/10`}
      >
        🤍 찜 {count}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={optimistic.wished}
      onClick={() =>
        startTransition(async () => {
          toggleOptimistic(null);
          await toggleWish(productId);
        })
      }
      className={`${base} cursor-pointer ${
        optimistic.wished
          ? "border-rose bg-rose/20 text-[#c2415a]"
          : "border-rose/50 bg-white text-[#c2415a] hover:bg-rose/10"
      }`}
    >
      <span className={optimistic.wished ? "animate-[wiggle_0.4s_ease-in-out_1]" : ""}>
        {optimistic.wished ? "❤️" : "🤍"}
      </span>
      찜 {optimistic.count}
    </button>
  );
}
