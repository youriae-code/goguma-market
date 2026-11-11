import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProducts } from "@/lib/product-queries";
import { CATEGORIES, getCategory, isCategory } from "@/lib/products";
import GogumaIcon from "@/components/GogumaIcon";
import ProductGrid from "@/components/ProductGrid";

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

      {/* 카테고리 + 판매글 목록 (주소의 ?category= 와 DB 를 읽어서 Suspense 안에서 그려요) */}
      <Suspense fallback={<ProductSectionSkeleton />}>
        <ProductSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** 카테고리 버튼 + 판매글 목록 */
async function ProductSection({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { category } = await searchParams;
  // 주소에 이상한 값이 들어와도 무시하고 "전체" 로 보여줘요.
  const selected = typeof category === "string" && isCategory(category) ? category : undefined;
  const products = await getProducts(selected);
  const selectedName = selected ? getCategory(selected).name : null;

  return (
    <>
      <section className="mt-12">
        <h2 className="mb-4 font-cute text-2xl text-ink">어떤 물건을 찾으세요?</h2>
        <ul className="grid grid-cols-5 gap-x-2 gap-y-4 sm:grid-cols-10">
          <CategoryChip href="/" emoji="🍠" name="전체" bg="bg-white" active={!selected} />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.value}
              href={`/?category=${c.value}`}
              emoji={c.emoji}
              name={c.name}
              bg={c.bg}
              active={selected === c.value}
            />
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-cute text-2xl text-ink">
          {selectedName ? `${selectedName} 판매글` : "방금 올라온 따끈한 물건"}
        </h2>
        <ProductGrid
          products={products}
          emptyText={selectedName ? `아직 ${selectedName} 판매글이 없어요` : "아직 판매글이 없어요"}
          emptyAction={
            <Link
              href="/products/new"
              className="inline-block rounded-2xl bg-goguma px-6 py-3 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
            >
              첫 판매글 올리기 ✏️
            </Link>
          }
        />
      </section>
    </>
  );
}

function CategoryChip({
  href,
  emoji,
  name,
  bg,
  active,
}: {
  href: string;
  emoji: string;
  name: string;
  bg: string;
  active: boolean;
}) {
  return (
    <li>
      <Link href={href} scroll={false} className="group flex flex-col items-center gap-1.5">
        <span
          className={`${bg} flex h-14 w-14 items-center justify-center rounded-3xl text-2xl transition group-hover:-translate-y-1 sm:h-16 sm:w-16 sm:text-3xl ${
            active ? "ring-4 ring-goguma/60 ring-offset-2 ring-offset-cream" : ""
          }`}
        >
          {emoji}
        </span>
        <span className={`text-center text-xs ${active ? "font-cute text-goguma-dark" : "text-ink/80"}`}>
          {name}
        </span>
      </Link>
    </li>
  );
}

function ProductSectionSkeleton() {
  return (
    <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-cream-deep" />
      ))}
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
        href="/products/new"
        className="rounded-2xl bg-goguma px-6 py-3 font-cute text-lg text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
      >
        내 물건 팔기 ✏️
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
