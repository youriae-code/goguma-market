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
- [x] **2단계: 판매글 CRUD** (쓰기 · 목록/상세 · 수정 · 삭제, 사진 없이)
- [x] **3단계: 사진 업로드** (여러 장, Supabase Storage)
- [x] **4단계: 찜하기 · 댓글/대댓글 · 댓글 좋아요** (+ 댓글 수정)
- [x] **5단계: 1:1 채팅** (Supabase Realtime)
- [ ] 다음 후보: 거래 후기·매너온도, 동네 설정, 채팅 알림 …

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

## 2단계에서 만든 것 — 판매글 CRUD

| 기능 | 주소 | 파일 |
| --- | --- | --- |
| **C**reate 글쓰기 | `/products/new` | `app/products/new/page.tsx`, 서버 액션 `createProduct` |
| **R**ead 목록 (카테고리 필터 + 제목 검색) | `/`, `/?category=living&q=무드등` | `app/page.tsx`, `components/SearchBar.tsx`, `getProducts()` |
| **R**ead 상세 | `/products/[id]` | `app/products/[id]/page.tsx`, `getProduct()` |
| **R**ead 내 판매글 | `/mypage` | `app/mypage/page.tsx`, `getProductsBySeller()` |
| **U**pdate 수정 (판매 상태 포함) | `/products/[id]/edit` | `app/products/[id]/edit/page.tsx`, 서버 액션 `updateProduct` |
| **D**elete 삭제 | 상세 화면의 삭제 버튼 | `app/products/[id]/DeleteButton.tsx`, 서버 액션 `deleteProduct` |

- `lib/products.ts` — 카테고리·판매 상태 목록, 타입, 가격/시간 표시 함수 (서버·브라우저 공용)
- `lib/product-queries.ts` — DB에서 판매글을 읽는 함수 (서버 전용)
- `app/products/actions.ts` — 쓰기·수정·삭제 서버 액션 + 입력값 검사
- `app/products/ProductForm.tsx` — 글쓰기와 수정에 같이 쓰는 폼
- `components/ProductCard.tsx`, `ProductGrid.tsx` — 목록 카드 (사진 자리엔 카테고리 이모지)

### DB: `public.products`

| 컬럼 | 설명 |
| --- | --- |
| `id` | 글 번호 (자동 증가) |
| `seller_id` | 작성자 (`profiles.id`), 기본값 `auth.uid()` |
| `title` | 제목 2~40자 |
| `description` | 설명 1~2000자 |
| `price` | 가격 0~1억 원 (0원 = 나눔) |
| `category` | `digital`, `furniture`, `clothes`, `books`, `kids`, `hobby`, `living`, `pets`, `etc` |
| `status` | `selling`(판매중) / `reserved`(예약중) / `sold`(거래완료) |
| `created_at`, `updated_at` | 작성·수정 시각 (`updated_at` 은 트리거가 자동 갱신) |
| `title_search` | 검색용: 제목에서 띄어쓰기를 뺀 글자 (DB 가 자동 계산하는 generated column) |

**검색:** 띄어쓰기를 무시하고, 검색어의 모든 단어가 제목에 들어간 글을 찾아요. 예) "패딩", "경량 패딩", "유니클로 패딩" → "유니클로 경량패딩 M"

RLS: 읽기는 누구나 / 쓰기·수정·삭제는 **본인 글만**. (화면에서 버튼을 숨기는 것만으로는 부족하고, DB 가 최종으로 막아줘요.)

## 3단계에서 만든 것 — 사진 여러 장 올리기

**흐름:** 사진 고르기 → 브라우저에서 미리보기 → 저장 버튼 → **브라우저가 사진을 줄여서 Storage 에 직접 업로드** → 저장된 경로만 서버 액션으로 전송 → DB 에 경로 목록 저장

- 서버 액션을 거치지 않고 브라우저가 바로 올리는 이유: 서버 액션은 보낼 수 있는 크기 제한(기본 1MB, Vercel 4.5MB)이 있어서 휴대폰 사진 여러 장은 넘쳐요.
- 올리기 전에 긴 변 1600px, JPEG 로 줄여요 (5MB 사진 → 수백 KB).
- 최대 10장, 첫 번째 사진이 대표 사진. "대표로" 버튼으로 바꿀 수 있어요.
- 수정하면서 뺀 사진, 삭제한 글의 사진은 Storage 에서도 지워요.

| 파일 | 하는 일 |
| --- | --- |
| `components/ImageUploader.tsx` | 사진 고르기·미리보기·빼기·대표 사진 정하기 |
| `lib/image-upload.ts` | 사진 줄이기(canvas) + Storage 업로드 (브라우저) |
| `app/products/ProductForm.tsx` | 저장할 때 새 사진을 먼저 올리고 서버 액션 호출 |
| `app/products/actions.ts` | 사진 경로 검사, 빠진 사진 Storage 에서 삭제 |
| `app/products/[id]/ImageGallery.tsx` | 상세 화면 사진 넘겨보기 + 썸네일 |
| `components/ProductCard.tsx` | 목록에 대표 사진 + 사진 수 표시 |
| `next.config.ts` | `next/image` 가 Supabase Storage 사진을 쓸 수 있게 허용 |

### Storage

- 버킷 `goguma-products` (공개 읽기, 1장당 5MB, jpeg/png/webp/gif 만)
- 파일 경로: `내 유저 id/랜덤이름.jpg`
- 보안 규칙: **내 id 폴더에만** 올리고 지울 수 있어요. 다른 사람 폴더는 목록도 안 보여요.
- `products.images` (text 배열, 최대 10개): 사진 경로 목록. 순서 = 보여주는 순서

## 4단계에서 만든 것 — 찜하기 · 댓글/대댓글 · 좋아요

| 기능 | 어디서 | 설명 |
| --- | --- | --- |
| 🤍 찜하기 | 상세 화면 가격 옆 | 누르면 바로 ❤️ 로 바뀌어요(useOptimistic). 내 글은 찜할 수 없고 "관심 n" 만 보여요 |
| 찜한 물건 | 마이페이지 | 내가 찜한 판매글 모아보기 |
| 💬 댓글 | 상세 화면 아래 | 판매글 작성자의 댓글엔 "판매자" 배지 |
| 대댓글(답글) | 댓글의 "답글 달기" | 한 단계까지만 (답글의 답글은 없어요) |
| ❤️ 좋아요 | 댓글·답글마다 | 댓글 좋아요 (판매글의 하트는 "찜") |
| 개수 표시 | 목록 카드 | 🤍찜 수 · 💬댓글 수 |

- 답글이 달린 댓글을 지우면 "삭제된 댓글이에요" 로 남고, 답글까지 다 지워지면 화면에서 사라져요.
- 내 댓글·답글은 **수정**할 수 있어요. 고치면 시간 옆에 "· 수정됨" 이 붙어요. (Esc 또는 취소로 닫기)
- 서버 액션: `app/products/[id]/social-actions.ts` / 조회: `lib/social-queries.ts`
- 화면: `WishButton.tsx`, `CommentSection.tsx`, `CommentItem.tsx`, `CommentForm.tsx`, `CommentEditForm.tsx` (`app/products/[id]/`)

### DB

| 테이블 | 설명 | 보안 규칙 |
| --- | --- | --- |
| `wishlists` (user_id, product_id) | 누가 무엇을 찜했는지 | 내 찜만 보고·추가·삭제, **내 글은 찜 불가** |
| `comments` | 댓글/답글 (`parent_id` 있으면 답글) | 누구나 읽기, 쓰기·삭제는 본인 |
| `comment_likes` (user_id, comment_id) | 댓글 좋아요 | 내 좋아요만 보고·추가·삭제 |

- `products.wish_count`, `products.comment_count`, `comments.like_count`: **트리거가 자동으로 세는** 개수 칸. 사용자는 이 칸을 직접 못 바꿔요(칸 단위 권한).
- 답글 규칙(같은 글, 답글의 답글 금지, 삭제된 댓글엔 답글 금지)은 DB 트리거가 검사해요.
- 누가 찜했는지는 비밀이고, 개수만 공개돼요.

## 5단계에서 만든 것 — 1:1 채팅

**흐름:** 판매글 상세 → 💬 채팅하기 → (방이 없으면 만들고) `/chats/[id]` 채팅방 → 메시지가 **실시간**으로 오가요.

| 기능 | 설명 |
| --- | --- |
| 채팅하기 | 판매글마다 구매자 1명당 방 1개. 이미 있으면 "채팅 이어가기" |
| 판매자 쪽 | 상세 화면에 "이 글로 온 채팅 n개" → 채팅 목록 |
| 실시간 | 상대가 보낸 메시지가 새로고침 없이 바로 나타나요 (Supabase Realtime) |
| 읽음 표시 | 안 읽은 내 메시지에 "1", 상대가 읽으면 "읽음" 으로 실시간 변경 |
| 채팅 목록 `/chats` | 상대 닉네임, 판매글, 마지막 메시지, 안 읽은 수 |
| 헤더 배지 | 💬 옆에 안 읽은 메시지 수 |
| 입력 | Enter 보내기, Shift+Enter 줄바꿈 (한글 조합 중 Enter 는 무시) |

- 날짜 구분선과 시간은 항상 **한국 시간**으로 보여줘요. (서버는 UTC 라서 `timeZone: "Asia/Seoul"` 로 고정)
- 파일: `app/chats/page.tsx`(목록), `app/chats/[id]/page.tsx` + `ChatRoom.tsx`(채팅방), `app/chats/actions.ts`(방 만들기·읽음), `lib/chat.ts`, `lib/chat-queries.ts`, `app/products/[id]/ChatButton.tsx`

### DB

| 테이블 | 설명 | 보안 규칙 |
| --- | --- | --- |
| `chat_rooms` | product_id + buyer_id(유일) + seller_id, 마지막 메시지 | **참여한 두 사람만** 보기. 판매자는 트리거가 판매글에서 채움, 내 글엔 채팅 불가 |
| `chat_messages` | room_id, sender_id, content(1~1000자), read_at | 참여자만 읽기·보내기. 읽음 표시는 **받은 사람만** |

- `chat_messages` 는 `supabase_realtime` 에 등록돼 있어요. Realtime 도 RLS 를 지켜서, 방 참여자에게만 메시지가 전달돼요.

## 배포

Vercel 에 가계부와 **별도 주소**로 배포했어요: https://goguma-market-pink.vercel.app
GitHub `main` 브랜치에 푸시하면 자동으로 다시 배포돼요.
환경 변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 는 Vercel 에 등록되어 있어요.
