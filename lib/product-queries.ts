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
 * 최신 판매글 목록.
 * - category 를 주면 그 카테고리만
 * - keyword 를 주면 제목에 그 단어가 들어간 글만 (대소문자 구분 없이)
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
  if (keyword) {
    // ilike 에서 % 와 _ 는 "아무 글자" 라는 특수문자라서, 사용자가 입력하면 글자 그대로 찾도록 \ 를 붙여요.
    const escaped = keyword.replace(/[\\%_]/g, (ch) => `\\${ch}`);
    query = query.ilike("title", `%${escaped}%`);
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
