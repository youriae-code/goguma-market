/** 통통 튀는 보라색 버튼. pending 이면 로딩 표시 */
export default function SubmitButton({
  pending,
  children,
  pendingText = "잠시만요…",
}: {
  pending: boolean;
  children: React.ReactNode;
  pendingText?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full cursor-pointer rounded-2xl bg-goguma py-3.5 font-cute text-lg text-white shadow-pop transition hover:translate-y-0.5 hover:shadow-none disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}
