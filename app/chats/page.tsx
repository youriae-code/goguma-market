import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getChatRooms } from "@/lib/chat-queries";
import { getImageUrl, timeAgo } from "@/lib/products";

export const metadata: Metadata = { title: "채팅 | 고구마마켓" };

export default function ChatsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-5 font-cute text-3xl text-goguma-dark">채팅 💬</h1>
      <Suspense fallback={<p className="py-16 text-center text-muted">채팅 목록을 불러오는 중…</p>}>
        <ChatList />
      </Suspense>
    </div>
  );
}

async function ChatList() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/chats");
  const rooms = await getChatRooms(userId);

  if (rooms.length === 0) {
    return (
      <div className="rounded-[2rem] border-2 border-dashed border-goguma/30 bg-white/60 px-6 py-14 text-center">
        <p className="text-4xl">💌</p>
        <p className="mt-3 font-cute text-xl text-ink">아직 채팅이 없어요</p>
        <p className="mt-1 text-sm text-muted">마음에 드는 물건의 &lsquo;채팅하기&rsquo;를 눌러 이웃과 이야기해 보세요.</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-2xl bg-goguma px-6 py-3 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
        >
          물건 구경하러 가기
        </Link>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-[2rem] border-2 border-white bg-white/80 shadow-soft">
      {rooms.map((room) => {
        const cover = room.product?.images[0];
        return (
          <li key={room.id} className="border-b border-peach/60 last:border-b-0">
            <Link href={`/chats/${room.id}`} className="flex items-center gap-3 px-4 py-4 transition hover:bg-cream sm:px-6">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                {cover ? (
                  <Image src={getImageUrl(cover)} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-2xl">🍠</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate font-cute text-ink">{room.otherName}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {room.lastMessageAt ? timeAgo(room.lastMessageAt) : "새 채팅"}
                  </span>
                </p>
                <p className="truncate text-xs text-muted">{room.product?.title ?? "삭제된 판매글"}</p>
                <p className={`truncate text-sm ${room.unread > 0 ? "text-ink" : "text-muted"}`}>
                  {room.lastMessage ?? "아직 대화가 없어요"}
                </p>
              </div>
              {room.unread > 0 && (
                <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-rose px-1.5 font-cute text-xs text-white">
                  {room.unread}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
