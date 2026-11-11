import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getProduct, parseProductId } from "@/lib/product-queries";
import { updateProduct } from "../../actions";
import ProductForm from "../../ProductForm";

export const metadata: Metadata = { title: "글 수정 | 고구마마켓" };

export default function EditProductPage({ params }: PageProps<"/products/[id]/edit">) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="font-cute text-3xl text-goguma-dark">판매글 수정 ✏️</h1>
      <div className="mt-6 rounded-[2rem] border-2 border-white bg-white/80 p-6 shadow-soft sm:p-8">
        <Suspense fallback={<p className="py-10 text-center text-muted">글을 불러오는 중… 🍠</p>}>
          <EditForm params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function EditForm({ params }: Pick<PageProps<"/products/[id]/edit">, "params">) {
  const { id: rawId } = await params;
  const id = parseProductId(rawId);
  if (id === null) notFound();

  const [product, userId] = await Promise.all([getProduct(id), getCurrentUserId()]);
  if (!product) notFound();
  // 남의 글이면 수정 화면 대신 상세 화면으로 돌려보내요.
  if (product.seller_id !== userId) redirect(`/products/${id}`);

  // bind: updateProduct(id, prevState, formData) 의 첫 번째 인자(id)를 미리 채워둬요.
  return (
    <ProductForm action={updateProduct.bind(null, id)} product={product} cancelHref={`/products/${id}`} />
  );
}
