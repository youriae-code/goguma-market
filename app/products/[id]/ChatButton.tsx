import Link from "next/link";
import { startChat } from "@/app/chats/actions";
import { getProductChatInfo } from "@/lib/chat-queries";

const big =
  "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-cute text-lg transition";

/**
 * 상세 화면의 채팅 버튼.
 * - 로그인 안 함: 로그인하러 가기
 * - 판매자(내 글): 이 글로 온 채팅 수 → 채팅 목록
 * - 구매자: 채팅하기 (이미 대화한 방이 있으면 "채팅 이어가기")
 */
export default async function ChatButton({
  productId,
  userId,
  isMine,
}: {
  productId: number;
  userId: string | null;
  isMine: boolean;
}) {
  if (!userId) {
    return (
      <Link href={`/login?next=/products/${productId}`} className={`${big} bg-goguma text-white shadow-pop hover:translate-y-0.5 hover:shadow-none`}>
        💬 채팅하기
      </Link>
    );
  }

  const { roomId, chatCount } = await getProductChatInfo(productId, userId, isMine);

  if (isMine) {
    return (
      <Link href="/chats" className={`${big} border-2 border-goguma/40 bg-white text-goguma-dark hover:bg-cream-deep`}>
        💬 이 글로 온 채팅 {chatCount}개
      </Link>
    );
  }

  if (roomId) {
    return (
      <Link href={`/chats/${roomId}`} className={`${big} bg-goguma text-white shadow-pop hover:translate-y-0.5 hover:shadow-none`}>
        💬 채팅 이어가기
      </Link>
    );
  }

  // 방이 없으면 서버 액션으로 방을 만들고 이동해요.
  return (
    <form action={startChat.bind(null, productId)}>
      <button type="submit" className={`${big} cursor-pointer bg-goguma text-white shadow-pop hover:translate-y-0.5 hover:shadow-none`}>
        💬 채팅하기
      </button>
    </form>
  );
}
