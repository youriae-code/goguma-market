import { createClient } from "@/lib/supabase/client";
import { IMAGE_BUCKET } from "@/lib/products";

/**
 * 브라우저에서 사진을 줄이고 Supabase Storage 에 바로 올리는 함수들.
 *
 * 왜 서버(서버 액션)를 거치지 않나요?
 * - 서버 액션은 한 번에 보낼 수 있는 크기 제한(기본 1MB, Vercel 은 4.5MB)이 있어요.
 * - 휴대폰 사진은 한 장에 3~10MB 라서 여러 장이면 금방 넘쳐요.
 * - 그래서 브라우저가 Storage 에 직접 올리고, 서버에는 "저장된 경로" 만 보내요.
 */

/** 긴 변 기준 최대 크기(px). 휴대폰 화면에는 이 정도면 충분해요. */
const MAX_SIZE = 1600;
/** JPEG 품질 (0~1) */
const QUALITY = 0.85;

/**
 * 사진을 MAX_SIZE 이하로 줄이고 JPEG 로 바꿔요. (5MB 사진 → 보통 300KB 안팎)
 * 휴대폰 사진의 회전 정보(EXIF)도 반영해서 똑바로 세워줘요.
 */
export async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없어요.");
  // 투명한 PNG 가 검게 나오지 않도록 흰 배경을 먼저 칠해요.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("이미지를 변환하지 못했어요."))),
      "image/jpeg",
      QUALITY,
    );
  });
}

/**
 * 사진 한 장을 줄여서 Storage 에 올리고, 저장된 경로를 돌려줘요.
 * 경로는 "내 유저 id/랜덤이름.jpg" — Storage 보안 규칙이 내 폴더에만 올리게 해요.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) throw new Error("로그인이 필요해요.");

  let blob: Blob;
  try {
    blob = await resizeImage(file);
  } catch {
    throw new Error(`'${file.name}' 은(는) 열 수 없는 사진 형식이에요. JPG·PNG 로 올려주세요.`);
  }

  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000", // 파일 이름이 매번 달라서 1년 동안 캐시해도 안전해요.
  });
  if (error) throw new Error(`사진을 올리지 못했어요: ${error.message}`);

  return path;
}

/** 올렸던 사진들을 Storage 에서 지워요 (글 저장에 실패했을 때 정리용) */
export async function removeUploadedImages(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from(IMAGE_BUCKET).remove(paths);
}
