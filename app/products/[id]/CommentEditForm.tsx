"use client";

import { useActionState, useEffect } from "react";
import { COMMENT_MAX } from "@/lib/products";
import { updateComment, type CommentFormState } from "./social-actions";

/**
 * 댓글·답글 고치기 입력칸.
 * 원래 내용이 채워진 채로 열리고, 저장하거나 취소하면 닫혀요(onClose).
 */
export default function CommentEditForm({
  productId,
  commentId,
  initialContent,
  onClose,
}: {
  productId: number;
  commentId: number;
  initialContent: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<CommentFormState, FormData>(
    updateComment.bind(null, productId, commentId),
    {},
  );

  // 저장이 끝나면 수정 모드를 닫아요.
  useEffect(() => {
    if (state.doneAt) onClose();
  }, [state.doneAt, onClose]);

  return (
    <form action={formAction} className="mt-1 space-y-2">
      <textarea
        name="content"
        // 에러가 나면 방금 고친 내용을, 아니면 원래 내용을 채워요.
        defaultValue={state.error ? state.content : initialContent}
        rows={2}
        maxLength={COMMENT_MAX}
        required
        autoFocus
        // Esc 키로 취소
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="w-full resize-y rounded-2xl border-2 border-goguma/50 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-goguma focus:ring-4 focus:ring-lavender"
      />
      <div className="flex items-center justify-end gap-2">
        {state.error && <p className="mr-auto pl-1 text-xs text-[#c2415a]">{state.error}</p>}
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="cursor-pointer rounded-full border-2 border-goguma/30 bg-white px-4 py-1.5 font-cute text-sm text-goguma-dark transition hover:bg-cream-deep"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-full bg-goguma px-4 py-1.5 font-cute text-sm text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
