"use client";

import { useActionState, useEffect } from "react";
import { COMMENT_MAX } from "@/lib/products";
import { addComment, type CommentFormState } from "./social-actions";

/**
 * 댓글(또는 답글) 입력칸.
 * parentId 가 있으면 그 댓글의 답글이 돼요.
 */
export default function CommentForm({
  productId,
  parentId = null,
  placeholder = "이웃에게 궁금한 점을 물어보세요 🍠",
  autoFocus = false,
  onDone,
}: {
  productId: number;
  parentId?: number | null;
  placeholder?: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState<CommentFormState, FormData>(
    addComment.bind(null, productId, parentId),
    {},
  );

  // 저장이 끝나면(doneAt 이 바뀌면) 답글 입력칸을 닫아요.
  useEffect(() => {
    if (state.doneAt) onDone?.();
  }, [state.doneAt, onDone]);

  return (
    // 제출이 끝나면 React 가 폼을 비워줘요(reset). 에러가 났을 땐 방금 쓴 내용이 defaultValue 로 다시 채워져요.
    <form action={formAction} className="space-y-2">
      <div className="flex items-end gap-2">
        <textarea
          name="content"
          defaultValue={state.error ? state.content : ""}
          rows={parentId ? 1 : 2}
          maxLength={COMMENT_MAX}
          required
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="min-h-11 flex-1 resize-y rounded-2xl border-2 border-peach bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-goguma focus:bg-white focus:ring-4 focus:ring-lavender"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-11 shrink-0 cursor-pointer rounded-2xl bg-goguma px-4 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "…" : parentId ? "답글" : "등록"}
        </button>
      </div>
      {state.error && <p className="pl-1 text-xs text-[#c2415a]">{state.error}</p>}
    </form>
  );
}
