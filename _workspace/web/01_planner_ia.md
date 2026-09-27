# 다잇누몰(가칭) — 사용자 웹 IA (stage=web)

> 작성: skin-planner, 2026-09-27. 관리자(`/admin/*`)는 2단계 범위라 이 문서에 없다.
> 데이터 이름은 `_workspace/api-contract.md`의 엔티티·필드명과 일치한다. 결정 필요 항목은 `01_planner_open-questions.md`.
>
> 변경(2026-09-27): 사용자 결정 **OQ-0 = 문의·견적 중심(B)** — 장바구니·주문서·결제(mock)·주문 완료·마이페이지(구매 내역·다운로드·라이선스 증서)·로그인/회원가입 라우트를 **전부 제거**. 회원 기능 없이 비회원 문의만 받고, 문의 상태는 `/contact/lookup`(접수번호+이메일)으로 조회. 가격은 "기준가"로 표기. 구현 그룹 ⑥(커머스) 삭제 후 재정렬.
> 변경(2026-09-27): 사용자 결정 **OQ-A = 언어 무관 동일가** — 가격은 (템플릿, 라이선스) 단위. 언어 버전은 파일·데모·버전 로그 구분 용도.
> 변경(2026-09-27): 사용자 결정 **OQ-1 = 개인/상업/확장 3종** — 상세에서 선택해 기준가를 보여주고 문의에 전달하는 정보.
> 변경(2026-09-27): 사용자 결정 **OQ-C = About Us 한 페이지 스크롤** — `/about` 하나에 4섹션(`#process` `#pricing` `#seo` `#maintenance`), 기존 `/about/*`는 `/about#섹션` 리다이렉트.
> 변경(2026-09-27): 사용자 웹 전 페이지 노이즈 오버레이, 대표 이미지 스크롤 잉크 번짐 리빌(SVG 필터) 적용 범위 추가(§6).

## 1. 용어
- 화면 표기 "템플릿" = 엔티티 `Skin`(API `/api/skins` 유지). 라우트는 `/templates/*`.
- "업종" = 엔티티 `Category`, 웹 쿼리 `industry`(API 쿼리 `category`로 매핑).
- "언어 버전" = 엔티티 `SkinVariant`, 쿼리 `lang`(Language 코드).
- **"기준가"** = 템플릿 × 라이선스별 공개 가격(`Skin.licenseOptions[].basePrice`). 사이트에서 결제하지 않으므로 "구매가·결제 금액·장바구니" 같은 표현을 쓰지 않는다. 제작 대행 요금은 "예상 비용"("~원부터", "별도 견적").

## 2. 중심 사용자 흐름

```
[발견]  메인 / 템플릿소개(업종·개발 언어 필터·검색)
[검증]  템플릿 상세: 갤러리 → 라이브 데모(PC·태블릿·모바일, 언어 버전별 데모) → 사양·포함 파일·업데이트 로그
[선택]  언어 버전 선택(HTML/React/PHP/Java…) + 라이선스 선택(개인/상업/확장) → 기준가 표시(언어 무관)
          └ 원하는 언어가 없으면 → "다른 언어 요청"(이메일로 출시 알림) 또는 문의하기 `custom_dev`(유료 견적)
[문의]  "이 템플릿으로 문의하기" → /contact?type=template_custom&template=&lang=&license=
          (요청 범위: 템플릿만 / 템플릿+설치·커스터마이징 / 이 디자인 기반 맞춤 제작)
[제작 대행 경로]  메인 · About Us(제작방법→제작비용→검색등록→유지보수) · 서비스소개 → 문의하기(production_quote/seo/maintenance)
[사후]  접수번호 + 이메일 답변 → /contact/lookup 에서 접수번호+이메일로 상태·답변 조회
```

디지털 상품·용역 모두 사이트 밖(견적·계약)에서 거래된다. 배송·재고·수량·결제 개념은 없다.

## 3. 사이트맵

```
다잇누몰 (web 레이아웃: 헤더[GNB 4 + 유틸] · 본문 · 푸터 · 노이즈 오버레이)
├─ 메인 /
├─ [GNB] About Us /about  (한 페이지 4섹션)
│  ├─ #process      제작방법
│  ├─ #pricing      제작비용
│  ├─ #seo          검색등록
│  └─ #maintenance  유지보수
├─ [GNB] 서비스소개 /services   (#{group} · #{feature} 앵커)
├─ [GNB] 템플릿소개 /templates   (업종 탭 · 언어·플랫폼·기준가·반응형 필터 · 정렬 · 검색)
│  ├─ 템플릿 상세 /templates/:slug
│  └─ 데모 미리보기 /templates/:slug/preview   (bare)
├─ [GNB] 문의하기 /contact
│  └─ 문의 조회 /contact/lookup
├─ [유틸] 검색 오버레이 → /templates?q=
├─ [유틸] 테마 전환(라이트/다크/시스템) — 라우트 없음
├─ [푸터] 고객지원: 문의하기 · 문의 조회 · FAQ /support/faq · 공지사항 /support/notices(/:noticeId)
├─ [푸터] 약관/정책 /policy/:policyType  (terms | privacy | license)
└─ 404 *
```

## 4. 라우트 표

레이아웃: `web` = 헤더+푸터+노이즈 / `bare` = 헤더·푸터 없음(노이즈는 유지 여부 디자이너 결정 — §6).
접근: 전 라우트 **공개**(로그인 없음).

| 경로 | 페이지 | 레이아웃 | 접근 | 비고(쿼리·리다이렉트) |
|---|---|---|---|---|
| `/` | 메인 | web | 공개 | |
| `/about` | About Us(한 페이지) | web | 공개 | 해시 `#process` `#pricing` `#seo` `#maintenance`(직접 진입 시 데이터 로드 후 해당 섹션으로 Lenis 스크롤, 헤더+서브내비 오프셋). 해시 없음 → 최상단. 알 수 없는 해시 무시. `#pricing-options`(추가 옵션표) 하위 앵커 허용 |
| `/about/process` `/about/pricing` `/about/seo` `/about/maintenance` | (리다이렉트) | — | 공개 | → `/about#process` 등 replace |
| `/services` | 서비스소개 | web | 공개 | 해시 `#{FeatureGroup.slug}` / `#{ServiceFeature.slug}` — 데이터 로드 후 Lenis 앵커 스크롤 |
| `/templates` | 템플릿 목록 | web | 공개 | 쿼리: `industry`(업종 slug, 단일), `lang`(Language 코드 콤마 다중, OR), `platform`(콤마 다중, OR), `price`(기준가 구간 `under50k`\|`50k-100k`\|`over100k`), `responsive`(`1`), `sort`(`popular`\|`newest`\|`price_asc`\|`price_desc`, 기본 `popular`), `q`, `page`(1부터). 기본값은 URL 생략, 필터·정렬·검색 변경 시 `page` 제거, 잘못된 값은 무시, 총 페이지 초과 → 마지막 페이지 replace |
| `/templates/:slug` | 템플릿 상세 | web | 공개 | 쿼리: `lang`(없거나 이 템플릿에 없는/`coming_soon` 값 → `SkinVariant.isDefault`, URL replace 보정), `license`(`personal`\|`commercial`\|`extended`, 없거나 판매하지 않는 값 → 첫 옵션). 해시: `#overview` `#demo` `#specs` `#changelog`. 없음·`draft`/`hidden` → 페이지 내 `NotFoundState` |
| `/templates/:slug/preview` | 데모 미리보기 | bare | 공개 | 쿼리: `device`(`desktop`\|`tablet`\|`mobile`, 기본 `desktop`), `lang`(상세와 같은 규칙), `demo`(SkinDemo id). 닫기 → `/templates/:slug?lang=&license=`(현재 값 유지) |
| `/skins`, `/skins/:slug`, `/skins/:slug/preview` | (리다이렉트) | — | 공개 | 같은 `/templates/…`로 쿼리·해시 유지 replace(`category`→`industry` 이름 변경) |
| `/search` | (리다이렉트) | — | 공개 | `?q=x` → `/templates?q=x` replace |
| `/contact` | 문의하기 | web | 공개 | 쿼리(프리필): `type`(InquiryType: `production_quote`\|`template_custom`\|`custom_dev`\|`seo`\|`maintenance`\|`license`\|`technical`\|`other`, 없으면 `production_quote`), `template`(Skin slug), `lang`(Language 코드), `license`(라이선스 코드), `plan`(PricingPlan code), `feature`(ServiceFeature slug, 콤마 다중). 알 수 없는 값 무시. 제출 후 같은 URL에서 성공 화면으로 교체 |
| `/contact/lookup` | 문의 조회 | web | 공개 | 쿼리: `no`(접수번호 프리필 — 성공 화면·안내 메일 링크에서 진입). 이메일은 쿼리로 받지 않는다(노출 방지) |
| `/support` | (리다이렉트) | — | 공개 | → `/support/faq` |
| `/support/inquiry` | (리다이렉트) | — | 공개 | → `/contact` |
| `/support/faq` | FAQ | web | 공개 | 쿼리: `category`(FaqCategory 코드), `q` |
| `/support/notices` | 공지사항 목록 | web | 공개 | 쿼리: `page` |
| `/support/notices/:noticeId` | 공지 상세 | web | 공개 | 없음 → `NotFoundState` |
| `/policy` | (리다이렉트) | — | 공개 | → `/policy/terms` |
| `/policy/:policyType` | 약관/정책 | web | 공개 | `terms`\|`privacy`\|`license`, 쿼리 `version`. 그 외 값 → 404 페이지 |
| `/cart` `/checkout*` `/login` `/signup` `/password/*` `/mypage*` | (제거) | — | — | 라우트 정의하지 않음 → `*` 404. 외부 유입 가능성이 낮아 별도 리다이렉트 없음 |
| `*` | 404 | web | 공개 | |

### 공통 규칙
1. **리소스 404**: 동적 세그먼트 대상이 없으면 URL 유지 + 레이아웃 안 `NotFoundState`.
2. **스크롤(Lenis)**: 라우트 전환 시 최상단 즉시 이동(`immediate`). 해시가 있으면 데이터 로드 후 `lenis.resize()` → `lenis.scrollTo('#id', { offset: -(헤더 + sticky 서브내비) })`. **같은 페이지 안 해시 링크**(예: `/about`에서 GNB의 "제작비용")는 라우트 전환 없이 Lenis 부드러운 스크롤 + `history.replaceState`로 해시만 갱신. 뒤로가기는 이전 스크롤 위치 복원.
3. **테마**: 모든 라우트 공통(localStorage `daitnu:theme`, 기본 `system`). 데모 iframe 내부는 템플릿 원본 색.
4. **노이즈·리빌**: §6.

## 5. 전역 내비게이션

### 헤더
| 영역 | 항목 | 링크 / 동작 |
|---|---|---|
| 로고 | 다잇누몰 | `/` |
| GNB | About Us | `/about` · 드롭다운: 제작방법 `/about#process` · 제작비용 `/about#pricing` · 검색등록 `/about#seo` · 유지보수 `/about#maintenance` |
| GNB | 서비스소개 | `/services` |
| GNB | 템플릿소개 | `/templates` · 메가메뉴: 업종(`/templates?industry=`) · 개발 언어(`/templates?lang=`) · 대표 템플릿 카드 · 전체 보기 |
| GNB | 문의하기 | `/contact` (강조형 버튼) |
| 유틸 | 검색 | 오버레이 → `/templates?q=` (⌘K/Ctrl+K) |
| 유틸 | 테마 | 드롭다운 라이트/다크/시스템 |

계정·장바구니 유틸은 없다. GNB 활성: `/about` → About Us, `/services` → 서비스소개, `/templates/*` → 템플릿소개, `/contact*` → 문의하기.

### 반응형 헤더 요약
| 구간 | GNB | 유틸 |
|---|---|---|
| 360–767 | 햄버거 → 전체 화면 메뉴(GNB 아코디언 — About Us 4섹션 링크 펼침, 테마 세그먼트, 하단 고정 "제작 문의하기") | 검색 · 햄버거 |
| 768–1023 | 햄버거 → 우측 Sheet 400px | 검색 · 테마 · 햄버거 |
| 1024–1439 | GNB 4개 + 드롭다운·메가메뉴 2열 | 검색 · 테마 |
| ≥1440 | GNB 4개 + 메가메뉴 3열, 최대 폭 1280 | 동일 |

### 푸터
About Us(4섹션 앵커) / 서비스·템플릿(서비스소개·전체 템플릿·신규 템플릿) / 고객지원(문의하기·문의 조회·FAQ·공지사항) / 정책(이용약관·**개인정보처리방침**·라이선스 정책) / 사업자 정보(SiteInfo).

## 6. 시각 효과 적용 범위(세부는 디자인 단계)
- **노이즈 오버레이**: 사용자 웹 레이아웃 루트에 `position:fixed` 오버레이 1개(`pointer-events:none`) — 모든 `web` 라우트. 관리자 레이아웃 제외. 다크 모드 블렌드·투명도, 모달·토스트·`bare` 미리보기 위 표시 여부는 디자이너 결정(참고 `_workspace/00_input/noise-ref/README.md`).
- **잉크 번짐 리빌**(스크롤 진행도에 따라 흑백 → 원색이 SVG 마스크로 번져 내려오는 효과, 참고 `_workspace/00_input/svg-filter-ref/README.md`): **대표 비주얼 이미지에만** 적용. 각 화면 명세의 `[리빌 후보]` 표시가 후보 목록. 템플릿 목록 카드·메인 템플릿 그리드처럼 같은 효과가 한 화면에 여러 개 동시에 도는 곳은 **성능상 비권장**(매 프레임 displacement 필터 재계산). 뷰포트 밖은 계산 생략, `prefers-reduced-motion`이면 원색 이미지 그대로. 한 뷰포트에 동시 활성 리빌은 최대 2개 권장(QA가 longtask로 실측).

## 7. 구현 그룹(명세 순서와 동일)

| 그룹 | 범위 | 라우트 |
|---|---|---|
| ① 공통 레이아웃 + 메인 | 헤더(GNB·메가메뉴·검색·테마), 모바일 메뉴, 푸터, 노이즈 오버레이, FOUC 방지 테마 스크립트, 공통 컴포넌트(`NotFoundState` `ErrorState` `EmptyState` `PriceTag` `SkinCard` `PageHero` `CtaBand` `InkReveal`), 리다이렉트 라우트 | `/`, 리다이렉트(`/about/*` `/skins/*` `/search` `/support` `/support/inquiry` `/policy`) |
| ② About Us | 한 페이지 4섹션 + sticky 서브내비(스크롤 스파이) | `/about` |
| ③ 서비스소개 | 기능 그룹·앵커·언어 매트릭스 | `/services` |
| ④ 템플릿소개 | 목록·상세·데모 미리보기·언어 요청 모달 | `/templates`, `/templates/:slug`, `/templates/:slug/preview` |
| ⑤ 문의하기 | 통합 문의 폼·문의 조회·FAQ·공지 | `/contact`, `/contact/lookup`, `/support/faq`, `/support/notices`, `/support/notices/:noticeId` |
| ⑥ 약관/정책 + 404 | | `/policy/:policyType`, `*` |
