"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser(nextPath: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return { supabase, userId };
}

/**
 * 판매글에서 "채팅하기" 를 누르면 실행돼요.
 * 이미 방이 있으면 그 방으로, 없으면 새로 만들어서 이동해요.
 * (판매자 id 는 DB 트리거가 판매글에서 가져와 채워요)
 */
export async function startChat(productId: number) {
  const { supabase, userId } = await requireUser(`/products/${productId}`);

  const { data: existing } = await supabase
    .from("chat_rooms")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", userId)
    .maybeSingle();
  if (existing) redirect(`/chats/${existing.id}`);

  const { data: created, error } = await supabase
    .from("chat_rooms")
    .insert({ product_id: productId })
    .select("id")
    .single();

  // 내 글이거나 글이 없어졌으면 상세 화면으로 돌아가요.
  if (error || !created) redirect(`/products/${productId}`);
  redirect(`/chats/${created.id}`);
}

/** 이 방에서 상대가 보낸 메시지를 모두 "읽음" 으로 표시해요. */
export async function markRoomRead(roomId: number) {
  const { supabase, userId } = await requireUser(`/chats/${roomId}`);
  await supabase
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("room_id", roomId)
    .neq("sender_id", userId)
    .is("read_at", null);
}
