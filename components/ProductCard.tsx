import Image from "next/image";
import Link from "next/link";
import { formatPrice, getCategory, getImageUrl, getStatus, timeAgo, type ProductSummary } from "@/lib/products";

/**
 * 목록에 보이는 판매글 카드.
 * 대표 사진(첫 번째 사진)을 보여주고, 사진이 없으면 카테고리 이모지를 크게 보여줘요.
 */
export default function ProductCard({ product }: { product: ProductSummary }) {
  const category = getCategory(product.category);
  const status = getStatus(product.status);
  const isSold = product.status === "sold";
  const cover = product.images[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-3xl border-2 border-white bg-white/80 shadow-soft transition hover:-translate-y-1"
    >
      <div
        className={`${category.bg} relative flex aspect-square items-center justify-center overflow-hidden text-6xl ${isSold ? "opacity-50 grayscale" : ""}`}
      >
        {cover ? (
          <Image
            src={getImageUrl(cover)}
            alt={product.title}
            fill
            // 화면 너비에 따라 카드가 몇 칸인지 알려주면, 알맞은 크기의 사진만 내려받아요.
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <span className="transition-transform group-hover:scale-110">{category.emoji}</span>
        )}
        {product.status !== "selling" && (
          <span className={`${status.badge} absolute top-3 left-3 rounded-full px-2.5 py-1 font-cute text-xs`}>
            {status.name}
          </span>
        )}
        {product.images.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-ink/60 px-2 py-0.5 text-[11px] text-white">
            📷 {product.images.length}
          </span>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="truncate text-ink">{product.title}</h3>
        <p className="font-cute text-lg text-goguma-dark">{formatPrice(product.price)}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <p className="min-w-0 truncate">
            {product.seller?.nickname ?? "이웃"} · {timeAgo(product.created_at)}
          </p>
          {/* 찜·댓글이 있을 때만 개수를 보여줘요 */}
          <p className="flex shrink-0 gap-1.5">
            {product.wish_count > 0 && <span aria-label={`찜 ${product.wish_count}`}>🤍{product.wish_count}</span>}
            {product.comment_count > 0 && <span aria-label={`댓글 ${product.comment_count}`}>💬{product.comment_count}</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
