/**
 * 채팅에서 서버·브라우저가 같이 쓰는 타입과 표시 함수.
 */

/** DB 의 chat_messages 한 줄 */
export type ChatMessage = {
  id: number;
  room_id: number;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

export const CHAT_MESSAGE_MAX = 1000;

// 시간은 항상 "한국 시간" 으로 보여줘요.
// (서버(Vercel)는 UTC, 브라우저는 한국 시간이라 그냥 쓰면 서버·브라우저 화면이 달라져 오류가 나요)
const timeFormat = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Seoul",
});
const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  timeZone: "Asia/Seoul",
});

/** "오후 3:12" */
export function formatChatTime(iso: string) {
  return timeFormat.format(new Date(iso));
}

/** "2026년 11월 11일 (수)" — 날짜가 바뀌는 곳에 구분선으로 보여줘요 */
export function formatChatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}
