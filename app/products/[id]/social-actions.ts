"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COMMENT_MAX } from "@/lib/products";

/**
 * 판매글 상세 화면의 "찜하기 · 댓글 · 좋아요" 서버 액션.
 * 끝나면 revalidatePath 로 상세 화면을 다시 그려서 최신 개수를 보여줘요.
 */

async function requireUser(productId: number) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect(`/login?next=/products/${productId}`);
  return { supabase, userId };
}

function refresh(productId: number) {
  revalidatePath(`/products/${productId}`);
}

// ---------------- 찜하기 ----------------
/** 찜했으면 취소하고, 안 했으면 찜해요 (토글) */
export async function toggleWish(productId: number) {
  const { supabase, userId } = await requireUser(productId);

  const { data: existing } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlists").delete().eq("user_id", userId).eq("product_id", productId);
  } else {
    // user_id 는 DB 기본값(auth.uid())이 넣어줘요. 내 글은 DB 보안 규칙이 막아요.
    await supabase.from("wishlists").insert({ product_id: productId });
  }

  refresh(productId);
  revalidatePath("/mypage");
}

// ---------------- 댓글 쓰기 ----------------
/** error 일 때는 방금 쓴 내용(content)을 돌려줘서 입력칸에 다시 채워요. */
export type CommentFormState = { error?: string; content?: string; doneAt?: number };

// 어느 글(productId)의 어느 댓글(parentId, 없으면 null)에 다는지는 bind 로 미리 넣어줘요.
export async function addComment(
  productId: number,
  parentId: number | null,
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const { supabase } = await requireUser(productId);

  const content = String(formData.get("content") ?? "")
    .replaceAll("\r\n", "\n")
    .trim();
  if (content.length < 1) return { error: "내용을 입력해 주세요." };
  if (content.length > COMMENT_MAX) return { error: `댓글은 ${COMMENT_MAX}자까지 쓸 수 있어요.`, content };

  const { error } = await supabase
    .from("comments")
    .insert({ product_id: productId, parent_id: parentId, content });

  if (error) {
    // DB 트리거가 보낸 한국어 메시지(예: "삭제된 댓글에는 답글을 달 수 없어요.")를 그대로 보여줘요.
    const message = error.message.includes("댓글") ? error.message : `댓글을 저장하지 못했어요: ${error.message}`;
    return { error: message, content };
  }

  refresh(productId);
  // doneAt: 저장이 끝났다는 신호. 폼이 이 값을 보고 입력칸을 비워요.
  return { doneAt: Date.now() };
}

// ---------------- 댓글 지우기 ----------------
/**
 * - 답글이 달린 댓글: 내용을 지우고 "삭제된 댓글이에요" 로 남겨요. (답글 대화가 끊기지 않게)
 * - 답글이 없는 댓글, 또는 답글: 완전히 지워요.
 */
export async function deleteComment(productId: number, commentId: number) {
  const { supabase, userId } = await requireUser(productId);

  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", commentId);

  if (count && count > 0) {
    await supabase
      .from("comments")
      .update({ content: "삭제된 댓글이에요", deleted_at: new Date().toISOString() })
      .eq("id", commentId)
      .eq("user_id", userId);
  } else {
    await supabase.from("comments").delete().eq("id", commentId).eq("user_id", userId);
  }

  refresh(productId);
}

// ---------------- 댓글 좋아요 ----------------
export async function toggleCommentLike(productId: number, commentId: number) {
  const { supabase, userId } = await requireUser(productId);

  const { data: existing } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .eq("user_id", userId)
    .eq("comment_id", commentId)
    .maybeSingle();

  if (existing) {
    await supabase.from("comment_likes").delete().eq("user_id", userId).eq("comment_id", commentId);
  } else {
    await supabase.from("comment_likes").insert({ comment_id: commentId });
  }

  refresh(productId);
}
