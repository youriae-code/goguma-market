"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { IMAGE_BUCKET, isCategory, isStatus, LIMITS, MAX_IMAGES } from "@/lib/products";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

/** 폼 아래에 보여줄 에러 + 다시 채워줄 입력값 */
export type ProductFormState = {
  error?: string;
  values?: {
    title?: string;
    description?: string;
    price?: string;
    category?: string;
    status?: string;
  };
};

/**
 * 폼 입력값을 꺼내서 검사해요.
 * 문제가 있으면 error 를, 괜찮으면 DB 에 넣을 data 를 돌려줘요.
 */
function readProductForm(formData: FormData) {
  const values = {
    title: String(formData.get("title") ?? "").trim(),
    // 브라우저는 textarea 의 줄바꿈을 \r\n 으로 보내요. \n 하나로 통일해서 저장해요.
    description: String(formData.get("description") ?? "").replaceAll("\r\n", "\n").trim(),
    price: String(formData.get("price") ?? "").replaceAll(",", "").trim(),
    category: String(formData.get("category") ?? ""),
    status: String(formData.get("status") ?? "selling"),
  };

  const fail = (error: string) => ({ error, values, data: null });

  if (values.title.length < LIMITS.titleMin || values.title.length > LIMITS.titleMax) {
    return fail(`제목은 ${LIMITS.titleMin}~${LIMITS.titleMax}글자로 써주세요.`);
  }
  if (!isCategory(values.category)) {
    return fail("카테고리를 골라주세요.");
  }
  // 숫자만 허용 (소수점, 음수 X)
  if (!/^\d+$/.test(values.price)) {
    return fail("가격은 숫자로만 입력해 주세요. 나눔이면 0원!");
  }
  const price = Number(values.price);
  if (price > LIMITS.priceMax) {
    return fail("가격은 1억 원 이하로 입력해 주세요.");
  }
  if (values.description.length < 1 || values.description.length > LIMITS.descriptionMax) {
    return fail(`설명은 1~${LIMITS.descriptionMax}자로 써주세요.`);
  }
  if (!isStatus(values.status)) {
    return fail("판매 상태가 올바르지 않아요.");
  }

  return {
    error: null,
    values,
    data: {
      title: values.title,
      description: values.description,
      price,
      category: values.category,
      status: values.status,
    },
  };
}

/**
 * 브라우저가 보낸 사진 경로들을 검사해요.
 * 다른 사람 폴더의 사진을 몰래 붙이지 못하도록 "내 id/파일이름" 모양만 허용해요.
 */
function readImagePaths(formData: FormData, userId: string): { error: string | null; paths: string[] } {
  const paths = formData.getAll("images").map(String);
  const pattern = new RegExp(`^${userId}/[\\w-]+\\.(jpg|jpeg|png|webp|gif)$`);

  if (paths.length > MAX_IMAGES) return { error: `사진은 최대 ${MAX_IMAGES}장까지예요.`, paths: [] };
  if (new Set(paths).size !== paths.length) return { error: "같은 사진이 두 번 들어 있어요.", paths: [] };
  if (!paths.every((path) => pattern.test(path))) return { error: "사진 정보가 올바르지 않아요.", paths: [] };
  return { error: null, paths };
}

/** Storage 에서 사진 파일들을 지워요. (실패해도 글 저장은 이미 끝났으니 조용히 넘어가요) */
async function removeImages(supabase: ServerSupabase, paths: string[]) {
  if (paths.length > 0) await supabase.storage.from(IMAGE_BUCKET).remove(paths);
}

/** 로그인한 사용자 id (없으면 로그인 페이지로) */
async function requireUserId(nextPath: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return { supabase, userId };
}

// ---------------- 만들기 (Create) ----------------
export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase, userId } = await requireUserId("/products/new");

  const form = readProductForm(formData);
  if (!form.data) return { error: form.error, values: form.values };

  const images = readImagePaths(formData, userId);
  if (images.error) return { error: images.error, values: form.values };

  // seller_id 는 DB 기본값(auth.uid())이 알아서 넣어줘요.
  // 새 글은 항상 "판매중" 으로 시작해요.
  const { data, error } = await supabase
    .from("products")
    .insert({ ...form.data, status: "selling", images: images.paths })
    .select("id")
    .single();

  if (error) {
    // 글 저장에 실패했으면 방금 올린 사진은 쓸 곳이 없으니 지워요.
    await removeImages(supabase, images.paths);
    return { error: `글을 저장하지 못했어요: ${error.message}`, values: form.values };
  }

  revalidatePath("/");
  redirect(`/products/${data.id}`);
}

// ---------------- 고치기 (Update) ----------------
// 어떤 글을 고칠지(id)는 bind 로 미리 넣어줘요: updateProduct.bind(null, id)
export async function updateProduct(
  id: number,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase, userId } = await requireUserId(`/products/${id}/edit`);

  const form = readProductForm(formData);
  if (!form.data) return { error: form.error, values: form.values };

  const images = readImagePaths(formData, userId);
  if (images.error) return { error: images.error, values: form.values };

  // 고치기 전 사진 목록 (빠진 사진을 Storage 에서 지우려고 미리 봐 둬요)
  const { data: before } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .eq("seller_id", userId)
    .maybeSingle();
  if (!before) {
    return { error: "내 글이 아니거나 이미 삭제된 글이에요.", values: form.values };
  }

  // RLS 가 "본인 글만 수정" 을 막아주지만, seller_id 조건도 함께 걸어서 의도를 분명히 해요.
  const { error } = await supabase
    .from("products")
    .update({ ...form.data, images: images.paths })
    .eq("id", id)
    .eq("seller_id", userId);

  if (error) {
    return { error: `수정하지 못했어요: ${error.message}`, values: form.values };
  }

  // 수정하면서 뺀 사진은 Storage 에서도 지워요.
  const removed = (before.images as string[]).filter((path) => !images.paths.includes(path));
  await removeImages(supabase, removed);

  revalidatePath("/");
  redirect(`/products/${id}`);
}

// ---------------- 지우기 (Delete) ----------------
export async function deleteProduct(id: number) {
  const { supabase, userId } = await requireUserId(`/products/${id}`);

  // 글을 지우면서 지운 글의 사진 경로를 돌려받아(returning) Storage 에서도 지워요.
  const { data } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("seller_id", userId)
    .select("images");

  await removeImages(supabase, (data ?? []).flatMap((row) => row.images as string[]));

  revalidatePath("/");
  redirect("/mypage?deleted=1");
}
