import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProducts } from "@/lib/product-queries";
import { CATEGORIES, getCategory, isCategory, type Category } from "@/lib/products";
import GogumaIcon from "@/components/GogumaIcon";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";

type SearchParams = PageProps<"/">["searchParams"];

/** 주소의 ?category=&q= 를 읽어서 정리해요. 이상한 값은 무시해요. */
async function readFilters(searchParams: SearchParams) {
  const { category, q } = await searchParams;
  return {
    category: typeof category === "string" && isCategory(category) ? category : undefined,
    keyword: typeof q === "string" ? q.trim().slice(0, 50) : "",
  };
}

/** 카테고리·검색어를 주소로 만들어요. 예) /?category=living&q=무드등 */
function listHref(category?: Category, keyword?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (keyword) params.set("q", keyword);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Suspense>
        <WelcomeBanner searchParams={searchParams} />
      </Suspense>

      {/* 히어로 + 검색창 (로그인·글쓰기 버튼은 오른쪽 위 헤더에 있어요) */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-peach via-cream-deep to-lavender px-6 py-12 shadow-soft sm:px-14 sm:py-14">
        <div className="relative z-10 max-w-xl">
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
          <div className="mt-7">
            {/* 주소의 검색어를 읽어야 해서 Suspense 안에 두고, 기다리는 동안엔 빈 검색창을 보여줘요 */}
            <Suspense fallback={<SearchBar />}>
              <SearchBarWithParams searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
        <GogumaIcon className="absolute -right-10 -bottom-12 h-48 w-48 animate-[float_4s_ease-in-out_infinite] opacity-50 sm:right-10 sm:bottom-auto sm:top-8 sm:h-72 sm:w-72 sm:opacity-95" />
      </section>

      {/* 카테고리 + 판매글 목록 (주소의 ?category=, ?q= 와 DB 를 읽어서 Suspense 안에서 그려요) */}
      <Suspense fallback={<ProductSectionSkeleton />}>
        <ProductSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchBarWithParams({ searchParams }: { searchParams: SearchParams }) {
  const { category, keyword } = await readFilters(searchParams);
  // key: 검색어가 바뀌면 검색창을 새로 그려서 입력칸 내용도 맞춰요.
  return <SearchBar key={`${category}-${keyword}`} keyword={keyword} category={category} />;
}

/** 카테고리 버튼 + 판매글 목록 */
async function ProductSection({ searchParams }: { searchParams: SearchParams }) {
  const { category, keyword } = await readFilters(searchParams);
  const products = await getProducts({ category, keyword });
  const categoryName = category ? getCategory(category).name : null;

  // 제목·빈 화면 문구는 "검색 중인지", "카테고리를 골랐는지" 에 따라 달라져요.
  let title = "방금 올라온 따끈한 물건";
  if (keyword) title = `‘${keyword}’ 검색 결과 ${products.length}개`;
  else if (categoryName) title = `${categoryName} 판매글`;

  return (
    <>
      <section className="mt-12">
        <h2 className="mb-4 font-cute text-2xl text-ink">카테고리</h2>
        <ul className="grid grid-cols-5 gap-x-2 gap-y-4 sm:grid-cols-10">
          {/* 카테고리를 바꿔도 검색어는 유지해요 */}
          <CategoryChip href={listHref(undefined, keyword)} emoji="🍠" name="전체" bg="bg-white" active={!category} />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.value}
              href={listHref(c.value, keyword)}
              emoji={c.emoji}
              name={c.name}
              bg={c.bg}
              active={category === c.value}
            />
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="min-w-0 font-cute text-2xl break-all text-ink">{title}</h2>
          {keyword && categoryName && (
            <span className="rounded-full bg-lavender px-3 py-1 font-cute text-sm text-goguma-dark">{categoryName}</span>
          )}
          {keyword && (
            <Link
              href={listHref(category)}
              scroll={false}
              className="rounded-full border-2 border-goguma/30 bg-white px-3 py-1 text-sm text-goguma-dark transition hover:bg-cream-deep"
            >
              검색 지우기 ✕
            </Link>
          )}
        </div>
        <ProductGrid
          products={products}
          emptyText={
            keyword
              ? `‘${keyword}’에 맞는 물건이 없어요`
              : categoryName
                ? `아직 ${categoryName} 판매글이 없어요`
                : "아직 판매글이 없어요"
          }
          emptyAction={
            keyword ? (
              <p className="text-sm text-muted">다른 단어로 검색하거나, 카테고리를 &lsquo;전체&rsquo;로 바꿔 보세요.</p>
            ) : (
              <Link
                href="/products/new"
                className="inline-block rounded-2xl bg-goguma px-6 py-3 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
              >
                첫 판매글 올리기 ✏️
              </Link>
            )
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
async function WelcomeBanner({ searchParams }: { searchParams: SearchParams }) {
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
