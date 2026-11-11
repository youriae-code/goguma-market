import Link from "next/link";
import GogumaIcon from "@/components/GogumaIcon";

/** 없는 주소나 삭제된 판매글로 들어왔을 때 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <GogumaIcon className="h-24 w-24 animate-[wiggle_1s_ease-in-out_infinite]" />
      <h1 className="mt-4 font-cute text-3xl text-goguma-dark">앗, 찾을 수 없어요</h1>
      <p className="mt-2 text-muted">삭제되었거나 없는 페이지예요.</p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-goguma px-6 py-3 font-cute text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
