<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🍠 고구마마켓 — 에이전트 작업 안내

당근마켓 같은 동네 중고거래 사이트. **개발 공부용 프로젝트**다.
위의 `nextjs-agent-rules` 블록은 `next dev`가 자동으로 다시 쓰므로 고치지 말고, 이 아래에만 내용을 추가한다.

## 1. 작업 방식 (가장 중요)

- 사용자는 **개발을 공부하는 중**이고, **한 번에 한 단계씩** 차근차근 만든다.
  - 요청받은 단계만 만든다. 다음 단계 기능을 미리 만들지 않는다. 필요해 보이면 "다음 단계 후보"로 제안만 한다.
  - 한 단계가 끝나면 README.md의 "단계별 진행 상황" 체크리스트를 갱신한다.
- 설명, 코드 주석, 커밋 메시지, UI 문구는 모두 **한국어**로 쓴다. 주석은 "왜 이렇게 하는지"를 초보자가 이해할 수 있게 짧게 쓴다.
- 지나치게 추상화하지 않는다. 공부하는 사람이 파일 하나를 열었을 때 흐름을 따라갈 수 있는 구조를 유지한다.
- 디자인: 트렌디하고 귀여운 **파스텔·따뜻한 톤**을 쓴다. 색은 `app/globals.css`의 `@theme` 토큰(cream, peach, butter, lavender, rose, goguma 등)만 쓴다. 글씨체는 제목 `font-cute`(Jua), 본문 Gowun Dodum이다. 모바일(375px)에서도 가로로 넘치지 않게 한다.

## 2. Supabase — ⚠️ 가계부와 같은 프로젝트를 재활용 중

- 프로젝트 ref는 `cyxjpsgjqtpmelkjnlxe`다. 사용자의 다른 프로젝트인 **가계부**(`~/Desktop/가계부`, GitHub `youriae-code/household-ledger`)와 **DB를 함께 쓴다.**
- **가계부 테이블 `public.entries`는 절대 건드리지 않는다.** 구조 변경, 삭제, RLS 수정 모두 금지다. 가계부는 로그인 없이 쓰는 공유 가계부라서, entries의 RLS를 바꾸면 가계부가 깨진다.
- `auth.users`도 두 앱이 공유한다. 나중에 가계부에 로그인을 붙이면 같은 회원 목록을 쓰게 된다는 점을 염두에 둔다.
- 고구마마켓 테이블 규칙:
  - 마이그레이션 이름은 `goguma_` 접두사를 붙인다 (예: `goguma_create_profiles`).
  - 새 테이블에는 반드시 RLS를 켜고 정책을 만든다. 만든 뒤에는 Supabase advisors(security)를 확인한다.
  - 상품, 채팅처럼 가계부와 헷갈릴 수 있는 새 테이블은 이름이 겹치지 않는지 먼저 `list_tables`로 확인한다.
  - DB를 바꾸기 전에 기존 테이블 구조부터 확인한다.
- 지금 있는 테이블:
  - `public.profiles`(id = auth.users.id, nickname은 2~12자이고 중복 불가, created_at)
    - 트리거 `on_auth_user_created`가 가입할 때 user_metadata의 nickname으로 프로필을 자동 생성한다.
    - RLS: 조회는 누구나 할 수 있고, 수정은 본인만 할 수 있다.
  - `public.products`(판매글, 2단계): seller_id → profiles.id(기본값 auth.uid()), title, description, price(0 = 나눔), category, status(selling/reserved/sold), created_at, updated_at
    - 트리거 `products_set_updated_at`(함수 `goguma_set_updated_at`)이 updated_at을 자동으로 갱신한다.
    - RLS: 조회는 누구나 할 수 있고, insert/update/delete는 본인 글만 할 수 있다.
    - category와 status 값은 DB의 check 제약조건과 `lib/products.ts`의 `CATEGORIES`/`STATUSES`가 **항상 같아야 한다.** 하나를 바꾸면 둘 다 바꾼다.
    - `images text[]`(최대 10개, check 제약조건): Storage 경로 목록이다. 첫 번째가 대표 사진이다. 샘플 데이터는 사진 없이 `{}`이다.
  - Storage 버킷 `goguma-products`(3단계): 공개 읽기, 5MB, jpeg/png/webp/gif만 받는다.
    - 경로 규칙은 `{auth.uid()}/{uuid}.jpg`이다. storage.objects 정책(`goguma: ...` 3개)이 **내 폴더에서만** insert/select/delete를 허용한다. remove()에는 select 권한도 필요하다.
    - Storage 파일은 SQL로 직접 지울 수 없다(`storage.protect_delete`). 반드시 Storage API(`.remove()`)를 쓴다.
    - 사진은 **브라우저가 직접 업로드**한다(`lib/image-upload.ts`). 서버 액션의 크기 제한 때문이다. 서버 액션은 경로만 받고, `readImagePaths`로 "내 id 폴더" 경로인지 검사한다.
    - 글을 수정하면서 빠진 사진이나 삭제된 글의 사진은 서버 액션이 Storage에서 지운다. 글 저장이 실패하면 방금 올린 사진도 지운다.
    - 사용자가 사진을 올려 두고 저장하지 않은 채 떠나면 고아 파일이 남을 수 있다. (현재는 정리 기능이 없다)
    - 샘플 판매글 10개(id 6~15)는 테스트 계정 "테스트고구마" 이름으로 들어가 있다. 넣는 SQL과 지우는 SQL은 `supabase/seed-sample-products.sql`에 있다. 사용자가 직접 쓴 글("달콤한고구마")은 건드리지 않는다.
    - DB가 하나라서 샘플 데이터는 로컬과 운영 사이트에 **동시에** 보인다.
    - 샘플 글에는 **Unsplash 무료 라이선스 실사 사진**이 있다. 대부분 1장이고, 6·13·14번은 2장, 9·11번은 3장으로 총 17장이다. 테스트 계정 폴더에 있다. 출처와 작가는 `supabase/sample-photo-credits.md`에 있다.
      - 처음에는 canvas 일러스트 17장이었는데, 사용자 요청으로 실사로 바꾸고 일러스트는 Storage에서 지웠다.
      - "아기 바운서"는 마땅한 실사가 없어서 10번 글을 "아기 그네 의자 (실내용)"로 바꿨다.
      - 외부 사진을 받기 전에는 출처, 장수, 크기를 알리고 사용자 허락을 받는다. Unsplash+(유료) 사진은 쓰지 않는다.
    - 샘플 사진은 localhost에서 테스트 계정으로 로그인한 상태로 올렸다. 브라우저 세션 토큰으로 Storage REST에 POST(삭제는 DELETE + `prefixes`)하고, SQL로 `images`를 채웠다.
    - SQL로 updated_at을 되돌릴 때는 `products_set_updated_at` 트리거를 잠깐 disable했다가 다시 enable해야 한다. 안 그러면 트리거가 now()로 덮어써서 "수정됨"으로 보인다.
- 키: 코드와 Vercel에는 **publishable 키만** 쓴다. `service_role`/secret 키는 절대 코드, 커밋, 클라이언트에 넣지 않는다.
- 인증 설정의 현재 상태:
  - **이메일 인증(Confirm email)은 꺼져 있다.** 가입하면 바로 로그인된다. 켜면 `/auth/confirm` 라우트가 링크를 처리한다. 이때 Supabase의 URL Configuration에 localhost와 배포 주소의 `/auth/confirm`을 추가해야 한다.
  - **Leaked password protection은 꺼져 있다** (Pro 요금제 기능). 그래서 유출된 비밀번호로도 가입이 된다.

## 3. 비밀번호·보안 주의사항

- 비밀번호는 로그에 남기지 않고, 서버 액션의 반환값(`values`)에도 넣지 않는다. 다시 채워 줄 값은 이메일과 닉네임뿐이다.
- 서버에서 로그인을 확인할 때는 `supabase.auth.getClaims()`를 쓴다. `getSession()`은 서버에서 믿으면 안 된다.
- 로그인 후 이동 주소(`next`)는 내부 경로(`/`로 시작하고 `//`가 아닌 것)만 허용한다. 외부로 보내는 리다이렉트를 막기 위해서다.
- Chrome의 "비밀번호가 유출되었습니다" 경고는 그 비밀번호가 **다른 곳에서 이미 유출된 목록**에 있다는 뜻이다. 우리 사이트에서 새어 나갔다는 뜻이 아니다. 사용자가 다시 물으면 이렇게 설명하면 된다.
- 테스트 계정 정보는 `.env.test.local`(git 제외)에 있다. 테스트 로그인은 **로컬(localhost)에서만** 하고, 배포된 사이트에서는 사용자가 직접 확인한다.

## 4. Next.js 16 에서 걸렸던 점

- Middleware는 **Proxy**(`proxy.ts`)로 이름이 바뀌었다. 세션 갱신과 페이지 보호는 `lib/supabase/proxy.ts`가 한다. 보호할 경로는 `PROTECTED_PATHS`에 추가한다.
- `cacheComponents: true`가 기본으로 켜져 있다.
  - 쿠키나 `searchParams`를 읽는 컴포넌트는 `<Suspense>`로 감싼다. 그러지 않으면 빌드 에러가 난다.
  - Supabase가 `Date.now()`를 쓰기 때문에 `lib/supabase/server.ts`의 `createClient()`는 먼저 `await connection()`을 호출한다. 이 줄을 지우지 않는다.
- `searchParams`와 `params`는 Promise다. `PageProps<"/경로">` 타입을 쓴다.
- 로그인 사용자 조회는 `lib/auth.ts`의 `getCurrentUser()`로 통일한다. id만 필요하면 `getCurrentUserId()`를 쓴다.
- 판매글 읽기는 `lib/product-queries.ts`에, 쓰기·수정·삭제는 `app/products/actions.ts`에 둔다.
- 로그인이 필요한 새 경로를 만들면 `lib/supabase/proxy.ts`의 `PROTECTED_PATTERNS`(정규식)에 추가한다.
- textarea 값은 `\r\n`으로 들어오므로 저장하기 전에 `\n`으로 바꾼다.
- 홈 화면 상단에는 로그인·글쓰기 버튼을 두지 않는다(헤더와 중복). 그 자리는 물품 검색창이다.
  - 검색은 `?q=`로 하고 **제목만** 찾는다. 띄어쓰기는 무시한다.
    - DB의 generated column `products.title_search`(제목에서 공백을 모두 뺀 값)에 단어마다 `ilike`를 건다(AND). 그래서 "롱패딩"으로 "롱 패딩"을, "유니클로 패딩"으로 "유니클로 경량패딩"을 찾는다.
    - 검색어는 `normalize("NFC")` 후 공백으로 나눈다(최대 5단어). `%`, `_`, `\`는 이스케이프한다.
  - 카테고리(`?category=`)와 함께 쓸 수 있다. 칩을 누르면 검색어를 유지하고, 검색하면 고른 카테고리를 유지한다.

## 5. 개발 환경 (Windows)

- Node.js는 `C:\Program Files\nodejs`에 설치되어 있다. 셸에서 `node`를 찾지 못하면 PATH에 이 경로를 추가한다.
- 개발 서버는 `.claude/launch.json`의 `goguma-dev`다. 3000번 포트가 사용 중이면 3001번으로 열린다.
- 브라우저 패널이 숨겨져 있으면 `requestAnimationFrame`이 멈춰서 `<Suspense>` 내용이 화면에 안 바뀌어 보인다. 앱 버그가 아니다.
- 확인 순서: `npm run lint` → `npx tsc --noEmit` → `npm run build`.
- 이 PC의 시계는 DB(Supabase)보다 약 2분 빠르다. 로컬에서 방금 쓴 글이 "2분 전"으로 보여도 버그가 아니다. Vercel에서는 정상으로 보인다.
- `next.config.ts`를 바꾸면 개발 서버를 재시작해야 반영된다.
- 사진 업로드를 브라우저로 테스트할 때는 canvas로 이미지를 만든다. 그다음 `DataTransfer`로 `input[type=file].files`에 넣고 `change` 이벤트를 보낸다.
- 브라우저로 삭제를 테스트할 때는 `confirm()` 창이 뜬다. 자동 테스트에서는 `window.confirm = () => true`로 넘긴다.
- RLS 검증은 `execute_sql`에서 `begin; set local role authenticated; select set_config('request.jwt.claims', ...); ... rollback;` 방식으로 다른 사용자를 흉내 내서 확인한다.

## 6. Git · 배포

- GitHub: `youriae-code/goguma-market`(공개), 브랜치는 `main`이다. 커밋 작성자는 이 폴더에만 설정된 youriae-code(noreply)다.
- Vercel: 프로젝트는 `team-mul/goguma-market`, 주소는 https://goguma-market-pink.vercel.app 다.
  - GitHub와 연결되어 있어서 **`main`에 푸시하면 자동으로 운영 배포된다.** 그러니 푸시는 사용자가 요청할 때만 한다.
  - 환경 변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 Production, Preview, Development에 모두 등록되어 있다. 새 환경 변수가 생기면 Vercel에도 추가한다.
  - 가계부와는 **별도 주소**로 배포한다.
- `.env.local`(Supabase 키, `VERCEL_OIDC_TOKEN`)과 `.env.test.local`은 git에 올리지 않는다. 공유용으로는 `.env.example`만 둔다.
