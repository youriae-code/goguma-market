import type { Metadata } from "next";
import { createProduct } from "../actions";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "글쓰기 | 고구마마켓" };

// 로그인 안 한 사람은 proxy.ts 가 로그인 페이지로 보내요.
export default function NewProductPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="font-cute text-3xl text-goguma-dark">내 물건 팔기 🍠</h1>
      <p className="mt-1 text-muted">이웃에게 소개할 물건 정보를 적어주세요. (사진은 다음 단계에서!)</p>
      <div className="mt-6 rounded-[2rem] border-2 border-white bg-white/80 p-6 shadow-soft sm:p-8">
        <ProductForm action={createProduct} cancelHref="/" />
      </div>
    </div>
  );
}
