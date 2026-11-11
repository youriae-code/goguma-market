import ProductCard from "./ProductCard";
import type { ProductSummary } from "@/lib/products";

/** 판매글 카드들을 바둑판처럼 놓아요. 글이 없으면 emptyText 를 보여줘요. */
export default function ProductGrid({
  products,
  emptyText,
  emptyAction,
}: {
  products: ProductSummary[];
  emptyText: string;
  emptyAction?: React.ReactNode;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-[2rem] border-2 border-dashed border-goguma/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-4xl">🧺</p>
        <p className="mt-3 font-cute text-xl text-ink">{emptyText}</p>
        {emptyAction && <div className="mt-5">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
