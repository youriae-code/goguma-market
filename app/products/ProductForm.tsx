"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CATEGORIES, LIMITS, STATUSES, type Product } from "@/lib/products";
import type { ProductFormState } from "./actions";
import FormField from "@/components/FormField";
import FormMessage from "@/components/FormMessage";
import PriceInput from "@/components/PriceInput";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full rounded-2xl border-2 border-peach bg-cream px-4 py-3 text-ink outline-none transition placeholder:text-muted/70 focus:border-goguma focus:bg-white focus:ring-4 focus:ring-lavender";

/**
 * 글쓰기·수정에 같이 쓰는 폼.
 * - product 가 없으면 "새 글", 있으면 "수정" 이에요.
 * - action 은 서버 액션 (createProduct 또는 updateProduct.bind(null, id))
 */
export default function ProductForm({
  action,
  product,
  cancelHref,
}: {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: Product;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  // 에러로 돌아왔으면 방금 입력한 값을, 아니면 원래 글의 값을 채워 넣어요.
  const v = state.values ?? {
    title: product?.title,
    description: product?.description,
    price: product ? String(product.price) : undefined,
    category: product?.category,
    status: product?.status,
  };
  const isEdit = Boolean(product);

  return (
    // key: 에러로 돌아올 때마다 폼을 새로 그려서 defaultValue 가 다시 적용되게 해요.
    <form key={JSON.stringify(state.values ?? {})} action={formAction} className="space-y-5">
      <FormField
        label="제목"
        name="title"
        placeholder="예) 거의 새 것인 무드등 팔아요"
        minLength={LIMITS.titleMin}
        maxLength={LIMITS.titleMax}
        defaultValue={v.title}
        required
      />

      <label className="block">
        <span className="mb-1.5 block font-cute text-ink">카테고리</span>
        <select name="category" defaultValue={v.category ?? ""} required className={inputClass}>
          <option value="" disabled>
            카테고리를 골라주세요
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </label>

      <PriceInput defaultValue={v.price} />

      {/* 판매 상태는 수정할 때만 바꿀 수 있어요. 새 글은 항상 "판매중" */}
      {isEdit && (
        <fieldset>
          <legend className="mb-1.5 font-cute text-ink">판매 상태</legend>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <label key={s.value} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  defaultChecked={(v.status ?? "selling") === s.value}
                  className="peer sr-only"
                />
                <span className="block rounded-2xl border-2 border-peach bg-cream py-2.5 text-center font-cute text-ink transition peer-checked:border-goguma peer-checked:bg-lavender peer-checked:text-goguma-dark peer-focus-visible:ring-4 peer-focus-visible:ring-lavender">
                  {s.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="block">
        <span className="mb-1.5 block font-cute text-ink">자세한 설명</span>
        <textarea
          name="description"
          rows={7}
          maxLength={LIMITS.descriptionMax}
          placeholder={"물건 상태, 사용 기간, 거래 희망 장소 등을 적어주세요.\n따뜻한 말 한마디도 좋아요 🍠"}
          defaultValue={v.description}
          required
          className={`${inputClass} resize-y`}
        />
      </label>

      <FormMessage error={state.error} />

      <div className="flex gap-3">
        <Link
          href={cancelHref}
          className="flex-1 rounded-2xl border-2 border-goguma/30 bg-white py-3.5 text-center font-cute text-lg text-goguma-dark transition hover:bg-cream-deep"
        >
          취소
        </Link>
        <div className="flex-[2]">
          <SubmitButton pending={pending} pendingText="저장하는 중…">
            {isEdit ? "수정 완료" : "글 올리기 🍠"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
