import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  PRODUCT_DETAIL_COLUMNS,
  PRODUCT_SUMMARY_COLUMNS,
  type Category,
  type Product,
  type ProductSummary,
} from "@/lib/products";

/**
 * 판매글을 읽어오는(Read) 함수 모음. 서버에서만 써요.
 */

/**
 * 검색어를 단어로 나눠요. 띄어쓰기는 검색 결과에 영향을 주지 않아요.
 * "유니클로  패딩" → ["유니클로", "패딩"]
 * normalize("NFC"): 맥·아이폰에서 복사한 한글이 자음·모음이 분리된 형태(NFD)일 때가 있어서 하나로 맞춰요.
 */
function toSearchWords(keyword: string) {
  return keyword.normalize("NFC").split(/\s+/).filter(Boolean).slice(0, 5);
}

/**
 * 최신 판매글 목록.
 * - category 를 주면 그 카테고리만
 * - keyword 를 주면 제목에 검색어의 **모든 단어**가 들어간 글만 (대소문자·띄어쓰기 무시)
 *   예) "패딩", "경량패딩", "경량 패딩", "유니클로 패딩" → 모두 "유니클로 경량패딩 M" 을 찾아요.
 */
export async function getProducts({
  category,
  keyword,
}: { category?: Category; keyword?: string } = {}): Promise<ProductSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(60);

  if (category) query = query.eq("category", category);
  // title_search 는 제목에서 띄어쓰기를 모두 뺀 칸이에요 (DB 가 자동으로 만들어요).
  // 단어마다 ilike 를 하나씩 붙이면 "모든 단어가 들어간 글" (AND) 이 돼요.
  for (const word of toSearchWords(keyword ?? "")) {
    // ilike 에서 % 와 _ 는 "아무 글자" 라는 특수문자라서, 사용자가 입력하면 글자 그대로 찾도록 \ 를 붙여요.
    const escaped = word.replace(/[\\%_]/g, (ch) => `\\${ch}`);
    query = query.ilike("title_search", `%${escaped}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`판매글 목록을 불러오지 못했어요: ${error.message}`);
  return (data ?? []) as unknown as ProductSummary[];
}

/** 특정 사람의 판매글 목록 (마이페이지용) */
export async function getProductsBySeller(sellerId: string): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`내 판매글을 불러오지 못했어요: ${error.message}`);
  return (data ?? []) as unknown as ProductSummary[];
}

/** 판매글 하나. 없으면 null */
export async function getProduct(id: number): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`판매글을 불러오지 못했어요: ${error.message}`);
  return data as unknown as Product | null;
}

/** 주소의 [id] 를 숫자로 바꿔요. 숫자가 아니면 null */
export function parseProductId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}
