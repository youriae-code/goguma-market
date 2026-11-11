import Link from "next/link";
import { getComments } from "@/lib/social-queries";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

/** 상세 화면 아래의 댓글 영역 (서버 컴포넌트: 댓글을 DB 에서 읽어와요) */
export default async function CommentSection({
  productId,
  sellerId,
  userId,
  count,
}: {
  productId: number;
  sellerId: string;
  userId: string | null;
  count: number;
}) {
  const comments = await getComments(productId, userId, sellerId);
  const isLoggedIn = Boolean(userId);

  return (
    <section className="mt-6 rounded-[2rem] border-2 border-white bg-white/80 p-6 shadow-soft sm:p-8">
      <h2 className="font-cute text-xl text-ink">
        댓글 <span className="text-goguma">{count}</span>
      </h2>

      {comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">아직 댓글이 없어요. 첫 댓글을 남겨 보세요! 💬</p>
      ) : (
        <ul className="mt-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} productId={productId} isLoggedIn={isLoggedIn} />
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-peach/60 pt-4">
        {isLoggedIn ? (
          <CommentForm productId={productId} />
        ) : (
          <Link
            href={`/login?next=/products/${productId}`}
            className="block rounded-2xl bg-cream py-3 text-center text-sm text-goguma-dark transition hover:bg-lavender/60"
          >
            로그인하고 댓글 남기기 🍠
          </Link>
        )}
      </div>
    </section>
  );
}
