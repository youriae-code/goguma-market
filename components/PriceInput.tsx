"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** 숫자만 남기고 천 단위 쉼표를 찍어요. "015000" → "15,000" */
function formatPrice(raw: string) {
  const digits = raw
    .replace(/\D/g, "") // 숫자가 아닌 글자(쉼표 포함) 모두 제거
    .replace(/^0+(?=\d)/, "") // 맨 앞의 불필요한 0 제거 (0 하나는 남김 = 나눔)
    .slice(0, 9); // 최대 1억(9자리)까지만
  return digits === "" ? "" : Number(digits).toLocaleString("ko-KR");
}

/**
 * 가격 입력칸. 입력하는 동안 "15000" 이 "15,000" 으로 바뀌어요.
 * 서버로는 쉼표가 들어간 글자가 가고, 서버 액션에서 쉼표를 빼고 숫자로 바꿔요.
 */
export default function PriceInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(() => formatPrice(defaultValue ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);
  // 쉼표가 생기면 커서가 맨 뒤로 튀어서, "커서 앞에 숫자가 몇 개였는지" 기억해 뒀다가 되돌려요.
  const digitsBeforeCaret = useRef<number | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: raw, selectionStart } = e.target;
    digitsBeforeCaret.current = raw.slice(0, selectionStart ?? raw.length).replace(/\D/g, "").length;
    setValue(formatPrice(raw));
  }

  // 화면이 바뀐 직후, 기억해 둔 위치로 커서를 옮겨요.
  useLayoutEffect(() => {
    const input = inputRef.current;
    const count = digitsBeforeCaret.current;
    if (!input || count === null || document.activeElement !== input) return;

    let position = 0;
    let seen = 0;
    while (position < value.length && seen < count) {
      if (/\d/.test(value[position])) seen++;
      position++;
    }
    input.setSelectionRange(position, position);
    digitsBeforeCaret.current = null;
  }, [value]);

  return (
    <label className="block">
      <span className="mb-1.5 block font-cute text-ink">가격</span>
      <div className="relative">
        <input
          ref={inputRef}
          name="price"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0 을 입력하면 나눔이에요 🧡"
          value={value}
          onChange={handleChange}
          required
          className="w-full rounded-2xl border-2 border-peach bg-cream py-3 pr-10 pl-4 text-ink outline-none transition placeholder:text-muted/70 focus:border-goguma focus:bg-white focus:ring-4 focus:ring-lavender"
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-cute text-muted">원</span>
      </div>
      {value === "0" && <span className="mt-1 block pl-1 text-xs text-goguma">나눔으로 올려요 🧡</span>}
    </label>
  );
}
