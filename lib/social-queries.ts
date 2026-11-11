import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  PRODUCT_SUMMARY_COLUMNS,
  timeAgo,
  type CommentRow,
  type CommentView,
  type ProductSummary,
} from "@/lib/products";

/**
 * 찜하기 · 댓글 · 좋아요를 읽어오는 함수 모음. 서버에서만 써요.
 */

/** 내가 이 글을 찜했는지 */
export async function isWished(userId: string | null, productId: number) {
  if (!userId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  return Boolean(data);
}

/** 내가 찜한 판매글 목록 (최근에 찜한 순서) */
export async function getWishedProducts(userId: string): Promise<ProductSummary[]> {
  const supabase = await createClient();
  // wishlists → products → profiles 를 한 번에 이어서 가져와요.
  const { data, error } = await supabase
    .from("wishlists")
    .select(`created_at, product:products(${PRODUCT_SUMMARY_COLUMNS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`찜한 물건을 불러오지 못했어요: ${error.message}`);
  return (data ?? [])
    .map((row) => (row as unknown as { product: ProductSummary | null }).product)
    .filter((product): product is ProductSummary => product !== null);
}

/**
 * 판매글의 댓글을 "댓글 → 그 아래 답글" 모양으로 정리해서 돌려줘요.
 * - 내가 좋아요 누른 댓글인지(likedByMe)도 함께 표시해요.
 * - 삭제된 댓글은 답글이 남아 있을 때만 "삭제된 댓글이에요" 로 보여주고, 답글도 없으면 숨겨요.
 */
export async function getComments(
  productId: number,
  userId: string | null,
  sellerId: string,
): Promise<CommentView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    // 댓글 작성자 닉네임도 "comments.user_id" 연결로 가져온다고 외래키 이름으로 알려줘요.
    .select(
      "id, product_id, user_id, parent_id, content, like_count, deleted_at, edited_at, created_at, author:profiles!comments_user_id_fkey(nickname)",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`댓글을 불러오지 못했어요: ${error.message}`);
  const rows = (data ?? []) as unknown as CommentRow[];

  // 내가 좋아요 누른 댓글 id 들
  let liked = new Set<number>();
  if (userId && rows.length > 0) {
    const { data: likes } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", userId)
      .in(
        "comment_id",
        rows.map((row) => row.id),
      );
    liked = new Set((likes ?? []).map((like) => like.comment_id as number));
  }

  const toView = (row: CommentRow): CommentView => ({
    id: row.id,
    authorName: row.author?.nickname ?? "이웃",
    isMine: row.user_id === userId,
    isSeller: row.user_id === sellerId,
    content: row.deleted_at ? "" : row.content,
    isDeleted: Boolean(row.deleted_at),
    isEdited: Boolean(row.edited_at) && !row.deleted_at,
    likeCount: row.like_count,
    likedByMe: liked.has(row.id),
    timeLabel: timeAgo(row.created_at),
    replies: [],
  });

  // 1) 댓글(부모)만 먼저 만들고  2) 답글을 부모 아래에 붙여요.
  const parents = new Map<number, CommentView>();
  for (const row of rows) {
    if (row.parent_id === null) parents.set(row.id, toView(row));
  }
  for (const row of rows) {
    if (row.parent_id !== null) parents.get(row.parent_id)?.replies.push(toView(row));
  }

  return [...parents.values()].filter((comment) => !comment.isDeleted || comment.replies.length > 0);
}
