/**
 * 판매글(products)과 관련된 공통 값·타입·도우미 함수.
 * 서버와 브라우저 양쪽에서 쓰므로 여기에는 DB 호출을 넣지 않아요.
 */

// ---------------- 카테고리 ----------------
// value 는 DB 에 저장되는 값 (DB 의 check 제약조건과 똑같아야 해요)
export const CATEGORIES = [
  { value: "digital", name: "디지털기기", emoji: "📱", bg: "bg-lavender" },
  { value: "furniture", name: "가구/인테리어", emoji: "🪑", bg: "bg-peach" },
  { value: "clothes", name: "의류", emoji: "👕", bg: "bg-butter" },
  { value: "books", name: "도서", emoji: "📚", bg: "bg-[#d8f0dc]" },
  { value: "kids", name: "유아동", emoji: "🧸", bg: "bg-rose/30" },
  { value: "hobby", name: "취미/게임", emoji: "🎮", bg: "bg-lavender" },
  { value: "living", name: "생활/주방", emoji: "🍳", bg: "bg-peach" },
  { value: "pets", name: "반려동물", emoji: "🐶", bg: "bg-butter" },
  { value: "etc", name: "기타", emoji: "🎁", bg: "bg-cream-deep" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export function getCategory(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function isCategory(value: string): value is Category {
  return CATEGORIES.some((c) => c.value === value);
}

// ---------------- 판매 상태 ----------------
export const STATUSES = [
  { value: "selling", name: "판매중", badge: "bg-[#d8f0dc] text-[#3f7a4d]" },
  { value: "reserved", name: "예약중", badge: "bg-butter text-[#8a6a12]" },
  { value: "sold", name: "거래완료", badge: "bg-[#e9e4e7] text-muted" },
] as const;

export type ProductStatus = (typeof STATUSES)[number]["value"];

export function getStatus(value: string) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

export function isStatus(value: string): value is ProductStatus {
  return STATUSES.some((s) => s.value === value);
}

// ---------------- 타입 ----------------
/** DB 의 products 한 줄 + 작성자 닉네임 */
export type Product = {
  id: number;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  seller: { nickname: string } | null;
};

/** 목록에 필요한 컬럼만 (설명은 길어서 빼요) */
export type ProductSummary = Omit<Product, "description" | "updated_at" | "seller_id">;

// Supabase select 에 넣는 문자열. seller:profiles(nickname) 은 "작성자 닉네임을 같이 가져와" 라는 뜻이에요.
export const PRODUCT_SUMMARY_COLUMNS =
  "id, title, price, category, status, created_at, seller:profiles(nickname)";
export const PRODUCT_DETAIL_COLUMNS =
  "id, seller_id, title, description, price, category, status, created_at, updated_at, seller:profiles(nickname)";

// ---------------- 입력값 제한 (DB 제약조건과 맞춰요) ----------------
export const LIMITS = {
  titleMin: 2,
  titleMax: 40,
  descriptionMax: 2000,
  priceMax: 100_000_000,
};

// ---------------- 화면 표시용 도우미 ----------------
/** 15000 → "15,000원", 0 → "나눔 🧡" */
export function formatPrice(price: number) {
  return price === 0 ? "나눔 🧡" : `${price.toLocaleString("ko-KR")}원`;
}

/** "방금 전", "3분 전", "2일 전" 처럼 보여줘요 */
export function timeAgo(isoDate: string) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return "방금 전";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(isoDate).toLocaleDateString("ko-KR");
}
