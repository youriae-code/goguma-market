import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { getProductsBySeller } from "@/lib/product-queries";
import { getWishedProducts } from "@/lib/social-queries";
import GogumaIcon from "@/components/GogumaIcon";
import ProductGrid from "@/components/ProductGrid";

export const metadata: Metadata = { title: "내 정보 | 고구마마켓" };

export default function MyPage({ searchParams }: PageProps<"/mypage">) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Suspense>
        <DeletedBanner searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<p className="py-20 text-center text-muted">내 정보를 불러오는 중… 🍠</p>}>
        <MyPageContent />
      </Suspense>
    </div>
  );
}

/** 글을 삭제하고 돌아왔을 때(?deleted=1) 알려줘요 */
async function DeletedBanner({ searchParams }: Pick<PageProps<"/mypage">, "searchParams">) {
  const { deleted } = await searchParams;
  if (!deleted) return null;
  return (
    <p className="mb-6 rounded-2xl bg-butter/70 px-5 py-3 text-center font-cute text-ink">
      🗑️ 판매글을 삭제했어요.
    </p>
  );
}

async function MyPageContent() {
  // proxy 에서도 막지만, 페이지에서도 한 번 더 확인하는 게 안전해요.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");

  const [myProducts, wishedProducts] = await Promise.all([
    getProductsBySeller(user.id),
    getWishedProducts(user.id),
  ]);

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
      {/* 내 정보 */}
      <section className="h-fit rounded-[2rem] border-2 border-white bg-white/80 p-7 text-center shadow-soft">
        <GogumaIcon className="mx-auto h-20 w-20" />
        <h1 className="mt-3 font-cute text-3xl text-goguma-dark">{user.nickname}님</h1>
        <dl className="mt-5 space-y-2.5 text-left text-sm">
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
        <form action={logout} className="mt-5">
          <button className="w-full cursor-pointer rounded-2xl border-2 border-goguma/40 py-3 font-cute text-goguma-dark transition hover:border-goguma hover:bg-cream-deep">
            로그아웃
          </button>
        </form>
      </section>

      {/* 내 판매글 */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-cute text-2xl text-ink">
            내 판매글 <span className="text-goguma">{myProducts.length}</span>
          </h2>
          <Link
            href="/products/new"
            className="rounded-full bg-goguma px-4 py-2 font-cute text-sm text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
          >
            ✏️ 글쓰기
          </Link>
        </div>
        <ProductGrid products={myProducts} emptyText="아직 올린 판매글이 없어요" />

        {/* 찜한 물건 */}
        <h2 className="mt-10 mb-4 font-cute text-2xl text-ink">
          찜한 물건 <span className="text-[#e0607a]">{wishedProducts.length}</span>
        </h2>
        <ProductGrid
          products={wishedProducts}
          emptyText="아직 찜한 물건이 없어요"
          emptyAction={<p className="text-sm text-muted">마음에 드는 물건의 🤍 찜 버튼을 눌러 보세요!</p>}
        />
      </section>
    </div>
  );
}
