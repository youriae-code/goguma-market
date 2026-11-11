import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/chat";
import type { ProductStatus } from "@/lib/products";

/**
 * 채팅을 읽어오는 함수 모음. 서버에서만 써요.
 * RLS 덕분에 "내가 참여한 방" 만 보여요.
 *
 * ⚠️ chat_rooms 는 profiles 와 두 번(buyer_id, seller_id) 이어져 있어서
 *    profiles 를 가져올 때 꼭 외래키 이름(chat_rooms_buyer_id_fkey 등)을 붙여요.
 */

const ROOM_COLUMNS = `
  id, product_id, buyer_id, seller_id, last_message, last_message_at, created_at,
  product:products(id, title, price, status, images),
  buyer:profiles!chat_rooms_buyer_id_fkey(nickname),
  seller:profiles!chat_rooms_seller_id_fkey(nickname)
`;

type RoomRow = {
  id: number;
  product_id: number;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  product: { id: number; title: string; price: number; status: ProductStatus; images: string[] } | null;
  buyer: { nickname: string } | null;
  seller: { nickname: string } | null;
};

/** 화면에 쓰기 좋게 정리한 채팅방 */
export type ChatRoomView = {
  id: number;
  product: RoomRow["product"];
  /** 대화 상대 닉네임 */
  otherName: string;
  /** 내가 판매자인지 (판매자면 "구매 문의" 로 보여요) */
  iAmSeller: boolean;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
};

function toView(row: RoomRow, userId: string, unread = 0): ChatRoomView {
  const iAmSeller = row.seller_id === userId;
  return {
    id: row.id,
    product: row.product,
    otherName: (iAmSeller ? row.buyer?.nickname : row.seller?.nickname) ?? "이웃",
    iAmSeller,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    unread,
  };
}

/** 내 채팅 목록 (최근 대화 순). 판매자 쪽에서는 아직 메시지가 없는 방은 숨겨요. */
export async function getChatRooms(userId: string): Promise<ChatRoomView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_rooms")
    .select(ROOM_COLUMNS)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`채팅 목록을 불러오지 못했어요: ${error.message}`);

  const rows = ((data ?? []) as unknown as RoomRow[]).filter(
    (row) => row.buyer_id === userId || row.last_message_at !== null,
  );

  // 방마다 안 읽은 메시지 수
  const unread = new Map<number, number>();
  if (rows.length > 0) {
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("room_id")
      .is("read_at", null)
      .neq("sender_id", userId)
      .in(
        "room_id",
        rows.map((row) => row.id),
      );
    for (const msg of msgs ?? []) unread.set(msg.room_id, (unread.get(msg.room_id) ?? 0) + 1);
  }

  return rows.map((row) => toView(row, userId, unread.get(row.id) ?? 0));
}

/** 채팅방 하나. 내가 참여한 방이 아니면 null */
export async function getChatRoom(roomId: number, userId: string): Promise<ChatRoomView | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("chat_rooms").select(ROOM_COLUMNS).eq("id", roomId).maybeSingle();
  return data ? toView(data as unknown as RoomRow, userId) : null;
}

/** 채팅방의 메시지 (오래된 것부터, 최근 200개) */
export async function getMessages(roomId: number): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, room_id, sender_id, content, read_at, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`메시지를 불러오지 못했어요: ${error.message}`);
  return ((data ?? []) as ChatMessage[]).reverse();
}

/** 헤더 배지용: 내가 안 읽은 메시지 수 (모든 방 합계) */
export async function getUnreadChatCount(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
    .neq("sender_id", userId);
  return count ?? 0;
}

/** 상세 화면용: 이 판매글에 대한 채팅 정보 */
export async function getProductChatInfo(productId: number, userId: string, isSeller: boolean) {
  const supabase = await createClient();
  if (isSeller) {
    // 판매자: 이 글로 대화 중인 채팅 수
    const { count } = await supabase
      .from("chat_rooms")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .not("last_message_at", "is", null);
    return { roomId: null, chatCount: count ?? 0 };
  }
  // 구매자: 이미 만든 방이 있으면 그 방으로
  const { data } = await supabase
    .from("chat_rooms")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", userId)
    .maybeSingle();
  return { roomId: (data?.id as number | undefined) ?? null, chatCount: 0 };
}
