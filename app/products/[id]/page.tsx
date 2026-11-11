import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getProduct, parseProductId } from "@/lib/product-queries";
import { formatPrice, getCategory, getStatus, timeAgo } from "@/lib/products";
import GogumaIcon from "@/components/GogumaIcon";
import DeleteButton from "./DeleteButton";
import ImageGallery from "./ImageGallery";

export const metadata: Metadata = { title: "판매글 | 고구마마켓" };

export default function ProductDetailPage({ params }: PageProps<"/products/[id]">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href="/" className="mb-5 inline-block text-sm text-muted hover:text-goguma-dark">
        ← 목록으로
      </Link>
      {/* 주소의 [id] 와 DB 는 요청 때마다 읽어야 해서 Suspense 안에서 그려요 */}
      <Suspense fallback={<DetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: Pick<PageProps<"/products/[id]">, "params">) {
  const { id: rawId } = await params;
  const id = parseProductId(rawId);
  if (id === null) notFound();

  const [product, userId] = await Promise.all([getProduct(id), getCurrentUserId()]);
  if (!product) notFound();

  const category = getCategory(product.category);
  const status = getStatus(product.status);
  const isMine = userId === product.seller_id;
  const isEdited = product.updated_at !== product.created_at;

  return (
    <article className="overflow-hidden rounded-[2rem] border-2 border-white bg-white/80 shadow-soft">
      {/* 사진이 있으면 갤러리, 없으면 카테고리 이모지 */}
      {product.images.length > 0 ? (
        <ImageGallery images={product.images} title={product.title} />
      ) : (
        <div className={`${category.bg} flex aspect-[2/1] items-center justify-center text-8xl`}>
          {category.emoji}
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* 판매자 */}
        <div className="flex items-center gap-3 border-b border-peach/70 pb-5">
          <GogumaIcon className="h-12 w-12 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-cute text-lg text-ink">{product.seller?.nickname ?? "이웃"}</p>
            <p className="text-xs text-muted">매너온도 36.5℃ 🔥</p>
          </div>
          {isMine && (
            <span className="ml-auto rounded-full bg-lavender px-3 py-1 font-cute text-xs text-goguma-dark">
              내 글
            </span>
          )}
        </div>

        {/* 본문 */}
        <div className="pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${status.badge} rounded-full px-2.5 py-1 font-cute text-xs`}>{status.name}</span>
            <h1 className="font-cute text-2xl text-ink">{product.title}</h1>
          </div>
          <p className="mt-2 text-sm text-muted">
            {category.name} · {timeAgo(product.created_at)}
            {isEdited && " · 수정됨"}
          </p>
          <p className="mt-3 font-cute text-3xl text-goguma-dark">{formatPrice(product.price)}</p>
          {/* whitespace-pre-wrap: 사용자가 입력한 줄바꿈을 그대로 보여줘요 */}
          <p className="mt-6 leading-relaxed break-words whitespace-pre-wrap text-ink">{product.description}</p>
        </div>

        {/* 내 글이면 수정·삭제 버튼 */}
        {isMine && (
          <div className="mt-8 flex gap-3 border-t border-peach/70 pt-6">
            <Link
              href={`/products/${product.id}/edit`}
              className="flex-1 rounded-2xl bg-goguma py-3 text-center font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
            >
              수정
            </Link>
            <DeleteButton id={product.id} />
          </div>
        )}
      </div>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border-2 border-white bg-white/80 shadow-soft">
      <div className="aspect-[2/1] animate-pulse bg-cream-deep" />
      <div className="space-y-3 p-8">
        <div className="h-6 w-1/2 animate-pulse rounded-full bg-cream-deep" />
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-cream-deep" />
        <div className="h-24 animate-pulse rounded-2xl bg-cream-deep" />
      </div>
    </div>
  );
}
