-- 🍠 고구마마켓 샘플 판매글 10개
-- 작성자: 테스트 계정 "테스트고구마"
-- 작성 시각을 조금씩 다르게 해서 "3시간 전", "2일 전" 처럼 다양하게 보이게 했어요.
--
-- 실행 방법: Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
-- 다시 지우려면 맨 아래 주석의 delete 문을 실행하세요.
--
-- 📷 사진: 이 SQL 은 글만 만들어요. 지금 DB 의 샘플 글(id 6~15)에는 실사 사진이 1~3장씩 붙어 있어요.
--    사진은 Unsplash 무료 라이선스 사진이고 (출처·작가: sample-photo-credits.md),
--    Storage 버킷 goguma-products 의 테스트 계정 폴더(e384526f-.../)에 있어요.
--    ⚠️ 아래 delete 문으로 글만 지우면 사진 파일은 Storage 에 남아요.
--       사진까지 지우려면 앱에서 테스트 계정으로 로그인해 글을 하나씩 삭제하거나,
--       Supabase 대시보드 → Storage 에서 해당 폴더를 지우세요. (Storage 파일은 SQL 로 직접 못 지워요)

insert into public.products (seller_id, title, description, price, category, status, created_at, updated_at)
select
  p.id,
  s.title,
  s.description,
  s.price,
  s.category,
  s.status,
  now() - s.ago,
  now() - s.ago
from public.profiles p
cross join (
  values
    ('아이패드 9세대 64GB 스페이스그레이',
     E'작년 봄에 사서 인강용으로만 썼어요.\n액정 필름 붙여서 흠집 없고, 배터리 성능 90%예요.\n충전기랑 케이스 같이 드려요!',
     280000, 'digital', 'selling', interval '25 minutes'),

    ('원목 2인 식탁 + 의자 2개',
     E'이사 가면서 내놓아요.\n상판에 생활 기스 조금 있지만 튼튼해요.\n분해가 안 돼서 1톤 트럭이나 SUV로 가져가셔야 해요 🙏',
     90000, 'furniture', 'selling', interval '2 hours'),

    ('유니클로 경량패딩 M (베이지)',
     E'두세 번 입었어요. 사이즈가 안 맞아서 정리합니다.\n세탁해서 깨끗해요.',
     15000, 'clothes', 'selling', interval '5 hours'),

    ('해리포터 전집 1~7권 (한글판)',
     E'아이가 다 읽어서 나눔해요 🧡\n책 모서리 살짝 눌린 거 말고는 상태 좋아요.\n문 앞 비대면으로 가져가셔도 돼요.',
     0, 'books', 'selling', interval '9 hours'),

    ('아기 그네 의자 (실내용)',
     E'패브릭 시트에 원목 봉이 달린 실내 그네예요.\n천장 고리에 걸어서 썼고, 커버는 세탁해 뒀어요.\n아기가 훌쩍 커버려서 내놓아요.',
     35000, 'kids', 'reserved', interval '1 day'),

    ('닌텐도 스위치 OLED + 동물의 숲',
     E'박스 풀구성이에요.\n조이콘 쏠림 없고 화면 보호 필름 붙어 있어요.\n동물의 숲 칩 포함 가격입니다 🎮',
     330000, 'hobby', 'selling', interval '1 day 6 hours'),

    ('에어프라이어 5.5L 거의 새 것',
     E'선물 받았는데 이미 있어서 두 번 써봤어요.\n바스켓 코팅 멀쩡해요. 고구마 굽기 딱 좋아요 🍠',
     40000, 'living', 'selling', interval '2 days'),

    ('고양이 캣타워 (중형)',
     E'스크래쳐 부분만 조금 뜯겼어요.\n높이 120cm, 해먹 있어요.\n저희 고양이가 안 써서 보내요 🐱',
     25000, 'pets', 'sold', interval '3 days'),

    ('필립스 무드등 (색 변경 가능)',
     E'리모컨으로 색이랑 밝기 조절돼요.\n밤에 켜두면 분위기 좋아요.',
     12000, 'living', 'selling', interval '4 days'),

    ('미개봉 텀블러 473ml',
     E'회사 기념품으로 받은 미개봉 새 제품이에요.\n색상은 연한 핑크예요.',
     8000, 'etc', 'selling', interval '6 days')
) as s(title, description, price, category, status, ago)
where p.nickname = '테스트고구마';

-- 샘플 데이터 지우기:
-- delete from public.products
-- where seller_id = (select id from public.profiles where nickname = '테스트고구마');
