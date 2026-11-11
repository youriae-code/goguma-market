import GogumaIcon from "./GogumaIcon";

/** 로그인·회원가입 화면을 감싸는 귀여운 카드 */
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <GogumaIcon className="h-20 w-20 animate-[float_3s_ease-in-out_infinite]" />
          <h1 className="mt-3 font-cute text-3xl text-goguma-dark">{title}</h1>
          <p className="mt-1 text-muted">{subtitle}</p>
        </div>
        <div className="rounded-[2rem] border-2 border-white bg-white/80 p-7 shadow-soft backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
