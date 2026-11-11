"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CHAT_MESSAGE_MAX, formatChatDate, formatChatTime, type ChatMessage } from "@/lib/chat";
import { markRoomRead } from "../actions";

/**
 * 1:1 채팅방 (브라우저에서 동작).
 *
 * - 처음 메시지들은 서버가 읽어서 넘겨줘요(initialMessages).
 * - 그다음부터는 Supabase Realtime 으로 새 메시지·읽음 표시를 "실시간" 으로 받아요.
 * - 메시지 보내기는 브라우저 Supabase 클라이언트로 바로 DB 에 넣어요.
 *   (누가 어느 방에 쓸 수 있는지는 DB 보안 규칙(RLS)이 지켜줘요)
 */
export default function ChatRoom({
  roomId,
  myId,
  otherName,
  initialMessages,
}: {
  roomId: number;
  myId: string;
  otherName: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Supabase 클라이언트는 한 번만 만들어서 계속 써요.
  const [supabase] = useState(() => createClient());

  /** 새 메시지를 목록에 넣거나(같은 id 면 바꿔치기) 해요. 내가 보낸 메시지가 두 번 들어가지 않게! */
  function upsert(message: ChatMessage) {
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === message.id);
      if (index === -1) return [...prev, message].sort((a, b) => a.id - b.id);
      const next = [...prev];
      next[index] = message;
      return next;
    });
  }

  // 1) 방에 들어오면 상대 메시지를 읽음 처리
  useEffect(() => {
    if (initialMessages.some((m) => m.sender_id !== myId && !m.read_at)) {
      markRoomRead(roomId);
    }
  }, [initialMessages, myId, roomId]);

  // 2) 실시간 구독: 이 방(room_id)의 새 메시지(INSERT)와 읽음 표시(UPDATE)
  useEffect(() => {
    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const message = payload.new as ChatMessage;
          upsert(message);
          // 상대가 보낸 메시지를 보고 있으니 바로 읽음 처리
          if (message.sender_id !== myId) markRoomRead(roomId);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => upsert(payload.new as ChatMessage),
      )
      .subscribe();

    // 화면을 떠나면 구독을 끊어요. (안 끊으면 연결이 계속 쌓여요)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, myId]);

  // 3) 메시지가 늘어나면 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send() {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ room_id: roomId, content })
      .select("id, room_id, sender_id, content, read_at, created_at")
      .single();

    setSending(false);
    if (error) {
      setError("메시지를 보내지 못했어요. 다시 시도해 주세요.");
      return;
    }
    setText("");
    upsert(data as ChatMessage);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // 한글 입력 중(글자 조합 중)에 Enter 를 누르면 마지막 글자가 두 번 보내지는 문제가 있어서 막아요.
    if (e.nativeEvent.isComposing) return;
    // Enter = 보내기, Shift + Enter = 줄바꿈
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // 내가 보낸 메시지 중 "마지막으로 읽힌" 것 (그 아래에만 "읽음" 을 붙여요)
  const lastReadMineId = [...messages].reverse().find((m) => m.sender_id === myId && m.read_at)?.id;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 메시지 목록 */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 && (
          <div className="py-16 text-center text-sm text-muted">
            <p className="text-4xl">👋</p>
            <p className="mt-3">{otherName}님에게 첫 메시지를 보내 보세요!</p>
            <p className="mt-1 text-xs">예) 안녕하세요, 아직 판매 중인가요?</p>
          </div>
        )}

        {messages.map((message, index) => {
          const mine = message.sender_id === myId;
          const prev = messages[index - 1];
          const newDay = !prev || formatChatDate(prev.created_at) !== formatChatDate(message.created_at);

          return (
            <div key={message.id}>
              {newDay && (
                <p className="my-4 text-center">
                  <span className="rounded-full bg-cream-deep px-3 py-1 text-xs text-muted">
                    {formatChatDate(message.created_at)}
                  </span>
                </p>
              )}
              <div className={`flex items-end gap-1.5 ${mine ? "flex-row-reverse" : ""}`}>
                <p
                  className={`max-w-[75%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                    mine
                      ? "rounded-br-md bg-goguma text-white"
                      : "rounded-bl-md border-2 border-peach bg-white text-ink"
                  }`}
                >
                  {message.content}
                </p>
                <div className={`flex shrink-0 flex-col pb-0.5 text-[11px] ${mine ? "items-end" : "items-start"}`}>
                  {/* 안 읽은 내 메시지에는 "1" 을 보여줘요 */}
                  {mine && !message.read_at && <span className="font-cute text-rose">1</span>}
                  {mine && message.id === lastReadMineId && <span className="text-muted">읽음</span>}
                  <span className="text-muted">{formatChatTime(message.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력칸 */}
      <div className="border-t border-peach/70 bg-white/90 p-3 sm:p-4">
        {error && <p className="mb-2 pl-1 text-xs text-[#c2415a]">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={CHAT_MESSAGE_MAX}
            placeholder="메시지 보내기 (Shift + Enter 줄바꿈)"
            aria-label="메시지 입력"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border-2 border-peach bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-goguma focus:bg-white focus:ring-4 focus:ring-lavender"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !text.trim()}
            className="h-11 shrink-0 cursor-pointer rounded-2xl bg-goguma px-5 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "…" : "보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}
