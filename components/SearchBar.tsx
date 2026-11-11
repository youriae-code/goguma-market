import Form from "next/form";

/**
 * 물건 검색창.
 * next/form 의 <Form> 은 제출하면 페이지 새로고침 없이 /?q=검색어 로 이동해요.
 * 카테고리를 고른 상태라면 그 카테고리 안에서 검색하도록 숨은 칸으로 같이 보내요.
 */
export default function SearchBar({ keyword = "", category }: { keyword?: string; category?: string }) {
  return (
    <Form action="/" scroll={false} role="search" className="relative w-full">
      {category && <input type="hidden" name="category" value={category} />}
      <label htmlFor="search" className="sr-only">
        물품 검색
      </label>
      <span className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-xl" aria-hidden="true">
        🔍
      </span>
      <input
        id="search"
        name="q"
        type="search"
        defaultValue={keyword}
        maxLength={50}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="어떤 물건을 찾으세요? 예) 무드등"
        className="w-full rounded-full border-2 border-white bg-white/90 py-4 pr-24 pl-14 text-ink shadow-soft outline-none transition placeholder:text-muted/80 focus:border-goguma focus:ring-4 focus:ring-lavender"
      />
      <button
        type="submit"
        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full bg-goguma px-5 py-2.5 font-cute text-white transition hover:bg-goguma-dark"
      >
        검색
      </button>
    </Form>
  );
}
