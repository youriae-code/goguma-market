"use client";

import { useTransition } from "react";
import { deleteProduct } from "../actions";

/** 정말 지울지 한 번 물어본 뒤 삭제해요 */
export default function DeleteButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("이 판매글을 삭제할까요?\n삭제하면 되돌릴 수 없어요.")) return;
    startTransition(() => deleteProduct(id));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="flex-1 cursor-pointer rounded-2xl border-2 border-rose/60 bg-white py-3 font-cute text-[#c2415a] transition hover:bg-rose/15 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "삭제하는 중…" : "삭제"}
    </button>
  );
}
