"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import type { CommentView } from "@/lib/products";
import GogumaIcon from "@/components/GogumaIcon";
import CommentForm from "./CommentForm";
import { deleteComment, toggleCommentLike } from "./social-actions";

/**
 * 댓글 하나 (+ 그 아래 답글들).
 * isReply 가 true 면 답글이라서 "답글 달기" 버튼이 없어요. (답글의 답글은 없어요)
 */
export default function CommentItem({
  comment,
  productId,
  isLoggedIn,
  isReply = false,
}: {
  comment: CommentView;
  productId: number;
  isLoggedIn: boolean;
  isReply?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [pending, startTransition] = useTransition();
  const closeReply = useCallback(() => setReplying(false), []);

  // 좋아요는 누르자마자 바뀌어 보이게 (useOptimistic)
  const [like, toggleLikeOptimistic] = useOptimistic(
    { liked: comment.likedByMe, count: comment.likeCount },
    (state) => ({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) }),
  );

  function handleLike() {
    startTransition(async () => {
      toggleLikeOptimistic(null);
      await toggleCommentLike(productId, comment.id);
    });
  }

  function handleDelete() {
    if (!confirm(isReply ? "이 답글을 삭제할까요?" : "이 댓글을 삭제할까요?")) return;
    startTransition(() => deleteComment(productId, comment.id));
  }

  const loginHref = `/login?next=/products/${productId}`;

  return (
    <li className={isReply ? "" : "border-b border-peach/60 py-4 last:border-b-0"}>
      <div className="flex gap-3">
        <GogumaIcon className={isReply ? "h-7 w-7 shrink-0" : "h-9 w-9 shrink-0"} />
        <div className="min-w-0 flex-1">
          {/* 작성자 · 시간 */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-cute text-ink">{comment.isDeleted ? "알 수 없음" : comment.authorName}</span>
            {comment.isSeller && !comment.isDeleted && (
              <span className="rounded-full bg-lavender px-2 py-0.5 font-cute text-[11px] text-goguma-dark">판매자</span>
            )}
            <span className="text-xs text-muted">{comment.timeLabel}</span>
          </div>

          {/* 내용 */}
          {comment.isDeleted ? (
            <p className="mt-1 text-sm text-muted italic">삭제된 댓글이에요</p>
          ) : (
            <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-wrap text-ink">{comment.content}</p>
          )}

          {/* 좋아요 · 답글 · 삭제 */}
          {!comment.isDeleted && (
            <div className="mt-2 flex items-center gap-3 text-xs">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLike}
                  aria-pressed={like.liked}
                  className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition hover:bg-rose/10 ${
                    like.liked ? "text-[#c2415a]" : "text-muted"
                  }`}
                >
                  {like.liked ? "❤️" : "🤍"} 좋아요 {like.count > 0 && like.count}
                </button>
              ) : (
                <Link href={loginHref} className="flex items-center gap-1 rounded-full px-2 py-1 text-muted hover:bg-rose/10">
                  🤍 좋아요 {like.count > 0 && like.count}
                </Link>
              )}

              {!isReply &&
                (isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => setReplying((open) => !open)}
                    className="cursor-pointer rounded-full px-2 py-1 text-muted transition hover:bg-lavender/60 hover:text-goguma-dark"
                  >
                    💬 답글 달기
                  </button>
                ) : (
                  <Link href={loginHref} className="rounded-full px-2 py-1 text-muted hover:bg-lavender/60">
                    💬 답글 달기
                  </Link>
                ))}

              {comment.isMine && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className="cursor-pointer rounded-full px-2 py-1 text-muted transition hover:bg-rose/10 hover:text-[#c2415a] disabled:opacity-50"
                >
                  삭제
                </button>
              )}
            </div>
          )}

          {/* 답글 목록 */}
          {comment.replies.length > 0 && (
            <ul className="mt-3 space-y-3 rounded-2xl bg-cream/80 p-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} productId={productId} isLoggedIn={isLoggedIn} isReply />
              ))}
            </ul>
          )}

          {/* 답글 입력칸 */}
          {replying && (
            <div className="mt-3">
              <CommentForm
                productId={productId}
                parentId={comment.id}
                placeholder={`${comment.authorName}님에게 답글 남기기`}
                autoFocus
                onDone={closeReply}
              />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
