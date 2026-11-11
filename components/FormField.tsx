/** 라벨 + 입력칸 한 묶음 */
export default function FormField({
  label,
  hint,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-cute text-ink">{label}</span>
      <input
        {...inputProps}
        className="w-full rounded-2xl border-2 border-peach bg-cream px-4 py-3 text-ink outline-none transition placeholder:text-muted/70 focus:border-goguma focus:bg-white focus:ring-4 focus:ring-lavender"
      />
      {hint && <span className="mt-1 block pl-1 text-xs text-muted">{hint}</span>}
    </label>
  );
}
