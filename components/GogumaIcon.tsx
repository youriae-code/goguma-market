/** 웃는 고구마 캐릭터 (SVG) */
export default function GogumaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* 잎사귀 */}
      <path d="M44 10c4-6 12-6 14-4-2 4-8 8-14 8z" fill="#9ed9a8" />
      <path d="M42 12c-1-6 3-10 6-11 1 4-1 9-5 12z" fill="#7cc78a" />
      {/* 몸통 */}
      <ellipse cx="32" cy="36" rx="20" ry="24" transform="rotate(35 32 36)" fill="#b48ae0" />
      <ellipse cx="32" cy="36" rx="20" ry="24" transform="rotate(35 32 36)" fill="url(#shine)" />
      {/* 볼터치 */}
      <ellipse cx="22" cy="42" rx="4" ry="2.6" fill="#ff9eaa" opacity="0.8" />
      <ellipse cx="40" cy="42" rx="4" ry="2.6" fill="#ff9eaa" opacity="0.8" />
      {/* 눈 */}
      <circle cx="25" cy="36" r="2.4" fill="#4a3b47" />
      <circle cx="37" cy="36" r="2.4" fill="#4a3b47" />
      <circle cx="25.8" cy="35.2" r="0.8" fill="#fff" />
      <circle cx="37.8" cy="35.2" r="0.8" fill="#fff" />
      {/* 입 */}
      <path d="M29 41q2 2.4 4 0" stroke="#4a3b47" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <defs>
        <radialGradient id="shine" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
