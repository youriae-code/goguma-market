# 🍠 고구마마켓

우리 동네 따끈한 중고거래 사이트 (개발 공부용 프로젝트)

- **Next.js 16** (App Router, Server Actions, Cache Components)
- **Supabase** (Auth + Postgres) — 가계부와 **같은 Supabase 프로젝트**를 사용
- **Tailwind CSS v4** — 파스텔 & 따뜻한 톤, 글씨체는 `Jua`(제목) + `Gowun Dodum`(본문)

## 실행하기

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 열어요.

`.env.local` 에 Supabase 주소와 publishable 키가 들어 있어요. (`.env.example` 참고)

## 단계별 진행 상황

- [x] **1단계: 회원가입 / 로그인 / 로그아웃**
- [ ] 2단계: 상품 등록 · 목록 · 상세
- [ ] 3단계: 이미지 업로드 (Supabase Storage)
- [ ] 4단계: 찜하기, 채팅 …

## 1단계에서 만든 것

| 파일 | 하는 일 |
| --- | --- |
| `lib/supabase/client.ts` | 브라우저용 Supabase 클라이언트 |
| `lib/supabase/server.ts` | 서버용 Supabase 클라이언트 (쿠키로 로그인 상태 유지) |
| `lib/supabase/proxy.ts`, `proxy.ts` | 요청마다 로그인 토큰 갱신 + `/mypage` 보호, 로그인 상태면 `/login`·`/signup` 막기 |
| `lib/auth.ts` | `getCurrentUser()` — 로그인한 사용자 + 닉네임 조회 |
| `app/auth/actions.ts` | 서버 액션: `signup`, `login`, `logout` |
| `app/auth/confirm/route.ts` | 이메일 인증 링크를 눌렀을 때 처리 |
| `app/login`, `app/signup`, `app/mypage` | 화면 |
| `components/` | 헤더, 고구마 캐릭터, 폼 부품 |

### DB (Supabase)

가계부의 `entries` 테이블은 건드리지 않고, 새 테이블만 추가했어요.

- `public.profiles` — `id`(= auth.users.id), `nickname`(2~12자, 중복 불가), `created_at`
- 회원가입 시 트리거 `on_auth_user_created` 가 닉네임으로 프로필을 자동 생성
- RLS: 닉네임 조회는 누구나, 수정은 본인만

### 알아두면 좋은 점

- 서버에서 로그인 확인은 `getSession()` 이 아니라 **`getClaims()`** 를 써요. (토큰 서명을 검증하기 때문)
- Next.js 16 에서는 Middleware 가 **Proxy**(`proxy.ts`)로 이름이 바뀌었어요.
- Cache Components 가 켜져 있어서, 쿠키를 읽는 부분(로그인 메뉴 등)은 `<Suspense>` 로 감싸야 해요.
- 지금 Supabase 프로젝트는 **이메일 인증이 꺼져 있어서** 가입하면 바로 로그인돼요.
  인증을 켜면 `/auth/confirm` 이 링크를 처리하니, Supabase 대시보드 → Authentication → URL Configuration 의
  Redirect URLs 에 `http://localhost:3000/auth/confirm` (배포 후엔 배포 주소도) 를 추가하세요.

## 배포

가계부와 별도의 주소로 배포할 예정이에요. (예: Vercel 새 프로젝트)
배포할 때 환경 변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 를 등록하면 돼요.
