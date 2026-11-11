import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import GogumaIcon from "@/components/GogumaIcon";

const CATEGORIES = [
  { emoji: "📱", name: "디지털기기", bg: "bg-lavender" },
  { emoji: "🪑", name: "가구/인테리어", bg: "bg-peach" },
  { emoji: "👕", name: "의류", bg: "bg-butter" },
  { emoji: "📚", name: "도서", bg: "bg-[#d8f0dc]" },
  { emoji: "🧸", name: "유아동", bg: "bg-rose/30" },
  { emoji: "🎮", name: "취미/게임", bg: "bg-lavender" },
  { emoji: "🍳", name: "생활/주방", bg: "bg-peach" },
  { emoji: "🐶", name: "반려동물", bg: "bg-butter" },
];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Suspense>
        <WelcomeBanner searchParams={searchParams} />
      </Suspense>

      {/* 히어로 */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-peach via-cream-deep to-lavender px-8 py-14 shadow-soft sm:px-14">
        <div className="relative z-10 max-w-lg">
          <p className="mb-3 inline-block rounded-full bg-white/70 px-3 py-1 text-sm text-goguma-dark">
            🍠 우리 동네 따끈한 중고거래
          </p>
          <h1 className="font-cute text-4xl leading-tight text-ink sm:text-5xl">
            필요 없는 물건도
            <br />
            <span className="text-goguma-dark">고구마처럼 따끈하게</span>
          </h1>
          <p className="mt-4 text-ink/80">
            가까운 이웃과 믿을 수 있게 사고팔아요.
            <br />
            내 서랍 속 물건이 누군가의 보물이 될지도 몰라요!
          </p>
          <div className="mt-7 flex min-h-14 flex-wrap gap-3">
            <Suspense>
              <HeroActions />
            </Suspense>
          </div>
        </div>
        <GogumaIcon className="absolute -right-10 -bottom-12 h-48 w-48 animate-[float_4s_ease-in-out_infinite] opacity-60 sm:right-10 sm:bottom-auto sm:top-8 sm:h-72 sm:w-72 sm:opacity-95" />
      </section>

      {/* 카테고리 (다음 단계에서 상품 목록과 연결 예정) */}
      <section className="mt-12">
        <h2 className="mb-4 font-cute text-2xl text-ink">어떤 물건을 찾으세요?</h2>
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {CATEGORIES.map((c) => (
            <li key={c.name} className="flex flex-col items-center gap-2">
              <span
                className={`${c.bg} flex h-16 w-16 items-center justify-center rounded-3xl text-3xl transition hover:-translate-y-1`}
              >
                {c.emoji}
              </span>
              <span className="text-center text-xs text-ink/80">{c.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-[2rem] border-2 border-dashed border-goguma/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-4xl">🧺</p>
        <p className="mt-3 font-cute text-xl text-ink">상품 목록은 곧 열려요!</p>
        <p className="mt-1 text-sm text-muted">다음 단계에서 상품 등록·목록 기능을 만들 예정이에요.</p>
      </section>
    </div>
  );
}

/** 가입 직후(?welcome=1)에만 보이는 환영 인사 */
async function WelcomeBanner({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { welcome } = await searchParams;
  if (!welcome) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <p className="mb-6 rounded-2xl bg-butter/70 px-5 py-3 text-center font-cute text-ink">
      🎉 환영해요, {user.nickname}님! 이제 고구마마켓의 이웃이 되었어요.
    </p>
  );
}

/** 로그인 여부에 따라 달라지는 히어로 버튼 */
async function HeroActions() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <Link
        href="/mypage"
        className="rounded-2xl bg-goguma px-6 py-3 font-cute text-lg text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
      >
        내 정보 보기
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/signup"
        className="rounded-2xl bg-goguma px-6 py-3 font-cute text-lg text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
      >
        지금 시작하기
      </Link>
      <Link
        href="/login"
        className="rounded-2xl bg-white/80 px-6 py-3 font-cute text-lg text-goguma-dark transition hover:bg-white"
      >
        로그인
      </Link>
    </>
  );
}
