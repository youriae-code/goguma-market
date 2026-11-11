"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/products";

/**
 * 상세 화면의 사진 보기.
 * 큰 사진 + 이전/다음 버튼 + 아래 작은 사진(썸네일)들. 사진을 누르면 그 사진으로 바뀌어요.
 */
export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (next: number) => setIndex((next + count) % count); // 끝에서 다음 → 처음으로

  return (
    <div className="bg-cream-deep">
      <div className="relative aspect-square sm:aspect-[4/3]">
        <Image
          src={getImageUrl(images[index])}
          alt={`${title} 사진 ${index + 1}`}
          fill
          sizes="(min-width: 768px) 720px, 100vw"
          className="object-contain"
          priority={index === 0}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="이전 사진"
              className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-lg text-goguma-dark shadow-soft transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="다음 사진"
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-lg text-goguma-dark shadow-soft transition hover:bg-white"
            >
              ›
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-ink/60 px-2.5 py-1 font-cute text-xs text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto bg-white/70 p-3">
          {images.map((path, i) => (
            <li key={path} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`사진 ${i + 1} 보기`}
                aria-current={i === index}
                className={`relative block h-16 w-16 cursor-pointer overflow-hidden rounded-xl transition ${
                  i === index ? "ring-4 ring-goguma" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={getImageUrl(path)} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
