/** 폼 아래 에러(분홍) / 안내(노랑) 말풍선 */
export default function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-rose/20 px-4 py-3 text-sm text-[#c2415a]">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p role="status" className="rounded-2xl bg-butter/60 px-4 py-3 text-sm text-ink">
        {message}
      </p>
    );
  }
  return null;
}
