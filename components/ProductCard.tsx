import Link from "next/link";
import { formatPrice, getCategory, getStatus, timeAgo, type ProductSummary } from "@/lib/products";

/**
 * 목록에 보이는 판매글 카드.
 * 아직 사진 기능이 없어서, 사진 자리에는 카테고리 이모지를 크게 보여줘요.
 */
export default function ProductCard({ product }: { product: ProductSummary }) {
  const category = getCategory(product.category);
  const status = getStatus(product.status);
  const isSold = product.status === "sold";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-3xl border-2 border-white bg-white/80 shadow-soft transition hover:-translate-y-1"
    >
      <div
        className={`${category.bg} relative flex aspect-square items-center justify-center text-6xl ${isSold ? "opacity-50 grayscale" : ""}`}
      >
        <span className="transition-transform group-hover:scale-110">{category.emoji}</span>
        {product.status !== "selling" && (
          <span className={`${status.badge} absolute top-3 left-3 rounded-full px-2.5 py-1 font-cute text-xs`}>
            {status.name}
          </span>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="truncate text-ink">{product.title}</h3>
        <p className="font-cute text-lg text-goguma-dark">{formatPrice(product.price)}</p>
        <p className="truncate text-xs text-muted">
          {product.seller?.nickname ?? "이웃"} · {timeAgo(product.created_at)}
        </p>
      </div>
    </Link>
  );
}
