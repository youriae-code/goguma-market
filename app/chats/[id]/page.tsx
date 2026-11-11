import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getChatRoom, getMessages } from "@/lib/chat-queries";
import { formatPrice, getImageUrl, getStatus } from "@/lib/products";
import ChatRoom from "./ChatRoom";

export const metadata: Metadata = { title: "채팅 | 고구마마켓" };

export default function ChatRoomPage({ params }: PageProps<"/chats/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-0 sm:px-4 sm:py-6">
      <Suspense fallback={<p className="py-20 text-center text-muted">채팅방을 여는 중… 💬</p>}>
        <ChatRoomContent params={params} />
      </Suspense>
    </div>
  );
}

async function ChatRoomContent({ params }: Pick<PageProps<"/chats/[id]">, "params">) {
  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) notFound();
  const roomId = Number(rawId);

  const userId = await getCurrentUserId();
  if (!userId) redirect(`/login?next=/chats/${roomId}`);

  // 내가 참여한 방이 아니면 RLS 때문에 null 이 와요 → 없는 페이지로
  const room = await getChatRoom(roomId, userId);
  if (!room) notFound();
  const messages = await getMessages(roomId);

  const product = room.product;
  const cover = product?.images[0];

  return (
    // 화면 높이에 맞춘 채팅 카드 (메시지 영역만 스크롤돼요)
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden border-white bg-white/80 shadow-soft sm:h-[calc(100dvh-7rem)] sm:rounded-[2rem] sm:border-2">
      {/* 상단: 대화 상대 + 판매글 */}
      <div className="border-b border-peach/70 bg-white/90 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/chats" className="rounded-full px-2 py-1 text-lg text-muted hover:bg-cream-deep" aria-label="채팅 목록으로">
            ‹
          </Link>
          <h1 className="min-w-0 truncate font-cute text-xl text-ink">{room.otherName}</h1>
          <span className="shrink-0 rounded-full bg-lavender px-2 py-0.5 font-cute text-[11px] text-goguma-dark">
            {room.iAmSeller ? "구매 문의" : "판매자"}
          </span>
        </div>

        {product && (
          <Link
            href={`/products/${product.id}`}
            className="mt-2 flex items-center gap-3 rounded-2xl bg-cream p-2 transition hover:bg-cream-deep"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
              {cover ? (
                <Image src={getImageUrl(cover)} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-2xl">🍠</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">
                <span className={`${getStatus(product.status).badge} mr-1.5 rounded-full px-2 py-0.5 font-cute text-[11px]`}>
                  {getStatus(product.status).name}
                </span>
                {product.title}
              </p>
              <p className="font-cute text-goguma-dark">{formatPrice(product.price)}</p>
            </div>
          </Link>
        )}
      </div>

      <ChatRoom roomId={roomId} myId={userId} otherName={room.otherName} initialMessages={messages} />
    </div>
  );
}
