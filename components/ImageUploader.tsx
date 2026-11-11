"use client";

import { useRef, useState } from "react";
import { MAX_IMAGES } from "@/lib/products";

/**
 * 사진 한 장의 상태
 * - 이미 올라간 사진: path 가 있어요 (수정할 때 기존 사진)
 * - 새로 고른 사진: file 이 있고, 저장 버튼을 누를 때 올라가요
 */
export type ImageItem = {
  id: string;
  path?: string;
  file?: File;
  /** 미리보기 주소 (새 사진은 blob: 주소, 기존 사진은 Storage 공개 주소) */
  preview: string;
};

/** 휴대폰 원본 사진도 받을 수 있게 넉넉히 (올리기 전에 줄여요) */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * 여러 장 사진 고르기 + 미리보기 + 빼기 + 대표 사진 정하기.
 * 사진 목록(items)은 부모(ProductForm)가 들고 있고, 여기서는 바꾸자고 알려주기만 해요(onChange).
 */
export default function ImageUploader({
  items,
  onChange,
  disabled,
}: {
  items: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const remaining = MAX_IMAGES - items.length;

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // 같은 사진을 다시 고를 수 있게 비워요.

    const messages: string[] = [];
    const images = picked.filter((file) => {
      if (!file.type.startsWith("image/")) {
        messages.push(`'${file.name}' 은(는) 사진이 아니에요.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        messages.push(`'${file.name}' 은(는) 20MB 가 넘어요.`);
        return false;
      }
      return true;
    });

    if (images.length > remaining) {
      messages.push(`사진은 최대 ${MAX_IMAGES}장까지예요. ${images.length - remaining}장은 빠졌어요.`);
    }

    const added: ImageItem[] = images.slice(0, remaining).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file), // 올리기 전에 브라우저에서 바로 보여주는 임시 주소
    }));

    setNotice(messages.length ? messages.join(" ") : null);
    if (added.length) onChange([...items, ...added]);
  }

  function remove(id: string) {
    const target = items.find((item) => item.id === id);
    if (target?.file) URL.revokeObjectURL(target.preview); // 임시 주소는 메모리를 쓰니까 정리해요.
    onChange(items.filter((item) => item.id !== id));
    setNotice(null);
  }

  function makeCover(id: string) {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    onChange([target, ...items.filter((item) => item.id !== id)]);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-cute text-ink">사진</span>
        <span className="text-xs text-muted">
          {items.length}/{MAX_IMAGES} · 첫 번째 사진이 대표 사진이에요
        </span>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {/* 사진 추가 버튼 */}
        {remaining > 0 && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-goguma/40 bg-cream text-goguma-dark transition hover:border-goguma hover:bg-lavender/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-2xl">📷</span>
              <span className="font-cute text-xs">사진 추가</span>
            </button>
          </li>
        )}

        {items.map((item, index) => (
          <li key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-cream-deep">
            {/* 미리보기는 blob: 임시 주소라서 next/image 대신 일반 img 를 써요 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.preview} alt={`사진 ${index + 1}`} className="h-full w-full object-cover" />

            {index === 0 ? (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-goguma px-2 py-0.5 font-cute text-[11px] text-white">
                대표
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(item.id)}
                disabled={disabled}
                className="absolute bottom-1.5 left-1.5 cursor-pointer rounded-full bg-white/90 px-2 py-0.5 font-cute text-[11px] text-goguma-dark shadow transition hover:bg-lavender"
              >
                대표로
              </button>
            )}

            <button
              type="button"
              onClick={() => remove(item.id)}
              disabled={disabled}
              aria-label={`사진 ${index + 1} 빼기`}
              className="absolute top-1.5 right-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-xs text-white transition hover:bg-ink"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="hidden"
      />

      {notice && <p className="mt-2 rounded-2xl bg-butter/60 px-3 py-2 text-xs text-ink">{notice}</p>}
      {items.length === 0 && (
        <p className="mt-1.5 pl-1 text-xs text-muted">사진이 없으면 카테고리 그림으로 보여줘요. 여러 장을 한 번에 고를 수 있어요.</p>
      )}
    </div>
  );
}
