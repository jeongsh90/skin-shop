# 다잇누몰(가칭) — 데이터 계약 (api-contract.md)

> 작성: skin-planner, 2026-09-27 (stage=web). 프론트 ↔ 서버의 유일한 약속. 1단계는 mock 어댑터, 3단계는 http 어댑터가 이 계약을 그대로 구현한다.
> 화면 명세 `_workspace/web/01_planner_spec.md`, 라우트 `_workspace/web/01_planner_ia.md`, 결정 필요 `_workspace/web/01_planner_open-questions.md`.
> **[관리자]** = 웹은 읽기만 하고 2단계 관리자 화면에서 편집할 필드. 관리자 전용 엔드포인트는 2단계에서 추가한다.
>
> 변경(2026-09-27): 사용자 결정 **OQ-0 = 문의·견적 중심** — 웹에서 회원·구매 기능 제거. `User`/`Session`/`Cart`/`Order`/`Payment`/`License`/`Download*`/`Review`/`SkinQuestion`/찜 및 관련 엔드포인트를 **§7 [보류]** 로 이동(웹 미사용). 문의는 비회원 `POST /api/inquiries` + `POST /api/inquiries/lookup`(접수번호+이메일). 언어 요청은 이메일 기반. 후기는 관리자 입력 `Testimonial`로 대체.
> 변경(2026-09-27): 사용자 결정 **OQ-A = 언어 무관 동일가** — 가격을 `SkinVariant`에서 제거하고 `Skin.licenseOptions[]`(템플릿 × 라이선스)로 이동. 필드명 `price` → **`basePrice`**(기준가), `Skin.minPrice` → `minBasePrice`.
> 변경(2026-09-27): 사용자 결정 **OQ-1 = 개인/상업/확장 3종** — `LicenseCode` 확정.
> 변경(2026-09-27): 사용자 결정 **OQ-C** — 계약 영향 없음(About Us 한 페이지는 화면 구조 변경).

## 0. 공통 규칙

- 필드명 camelCase. 금액은 **원 단위 정수, 부가세 포함**. 날짜·시각 ISO 8601 문자열. 파일 크기 바이트 정수. 버전 semver 문자열(비교는 semver 규칙).
- ID는 문자열. 사람이 보는 문의 접수번호는 `inquiryNumber`(`IQ20260927-0042`).
- **응답 래핑(중요)**
  - 페이지 목록: `Paginated<T> = { items: T[]; total: number; page: number; pageSize: number }`(page 1부터).
  - 비페이지 목록: `{ items: T[] }` — **맨 배열 금지**.
  - 단건: **엔티티 객체 그대로**(`{data}` 래핑 없음).
  - 본문 없는 성공: 204(mock은 `undefined`).
  - 에러: HTTP 상태 + `{ error: { code: string; message: string; fieldErrors?: Record<string,string> } }` → 프론트는 `ApiError{status, code, message, fieldErrors}` throw. code: `NOT_FOUND`(404), `VALIDATION`(400/422), `CONFLICT`(409), `TOO_MANY_REQUESTS`(429), `INTERNAL`(500).
- **인증 없음**: 웹의 모든 엔드포인트는 공개. (관리자 인증은 2단계에서 별도 정의 — mock 시드의 `admin@test.com`은 2단계용.)
- mock: localStorage `daitnu:mock:v2`(스키마 변경으로 v1→v2, 웹·관리자 공유), 150~400ms 랜덤 지연, URL `?mockError=1`이면 다음 요청 500.
- 클라이언트 전용 상태(계약 밖): 테마 `daitnu:theme`, 최근 검색어.

## 1. Enum / 코드 목록

| 이름 | 값 | 비고 |
|---|---|---|
| LanguageCode | `html` `react` `next` `vue` `nuxt` `php` `laravel` `java_spring` `java_jsp` `aspnet` `wordpress` `gnuboard` | 시드 기본안. 프론트는 하드코딩하지 말고 `GET /api/languages` 사용 **[관리자]** 추가 가능 |
| LanguageGroup | `frontend` `backend` `cms` | 필터 그룹 표시 |
| PlatformCode | `standalone` `cafe24` `godomall` `makeshop` `imweb` | 설치 대상 솔루션 |
| LicenseCode | `personal` `commercial` `extended` | 확정(OQ-1) |
| SkinStatus | `draft` `published` `discontinued` `hidden` | 웹 노출 `published`·`discontinued`(라이선스 제공 중단 — 상세 노출, 문의 CTA 변경). `draft`/`hidden` → 404 **[관리자]** |
| VariantStatus | `released` `coming_soon` `discontinued` `hidden` | `hidden`은 응답 제외 **[관리자]** |
| ImageDevice | `desktop` `tablet` `mobile` | |
| ChangeType | `added` `improved` `fixed` `security` | 추가/개선/수정/보안 |
| InquiryType | 제작·견적: `production_quote` `template_custom` `custom_dev` `seo` `maintenance` / 지원: `license` `technical` / `other` | 제작 견적 / 템플릿 문의 / 언어 버전 개발 / 검색등록 / 유지보수 / 라이선스 / 기술 지원 / 기타 |
| InquiryGroup | `production` `support` `other` | type에서 파생 |
| TemplateRequestScope | `license_only` `install_customize` `custom_build` | 템플릿만(라이선스) / 템플릿+설치·커스터마이징 / 이 디자인 기반 맞춤 제작 — `template_custom` 필수 |
| BudgetRange | `under1m` `1m-3m` `3m-5m` `over5m` `undecided` | |
| InquiryStatus | `received` `in_review` `answered` | 접수됨 / 검토 중 / 답변 완료 **[관리자]** |
| LanguageRequestStatus | `requested` `planned` `released` `declined` | **[관리자]** (웹은 집계만 사용) |
| PricingPlanKind | `production` `option` `seo` `maintenance` | |
| PriceType | `fixed` `from` `monthly` `unit` `quote` | `quote`면 price null |
| FeatureAvailability | `included` `option` | |
| NoticeCategory | `notice` `update` `event` `maintenance` | |
| PolicyType | `terms` `privacy` `license` | 환불정책 제거(온라인 결제 없음) |
| SkinSort | `popular` `newest` `price_asc` `price_desc` | 기본 `popular`. price는 `minBasePrice` 기준 |
| PriceRange | `under50k` `50k-100k` `over100k` | `minBasePrice` 기준(<50000 / 50000~100000 / >100000) |
| FaqCategoryCode | `production` `template` `language` `license` `seo` `maintenance` `technical` | 가정 |

## 2. 엔티티

### Category (업종)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| slug | string | Y | 유일. 웹 `?industry=` / API `?category=` |
| name | string | Y | 병원·의료, 법률·세무, 교육·학원, 쇼핑몰, 기업·제조, 카페·외식, 부동산·건설, 뷰티·헬스, 포트폴리오·에이전시, 공공·단체 (시드) |
| description | string \| null | Y | |
| imageUrl | string \| null | Y | 메인 업종 카드 |
| skinCount | number | Y | 공개 템플릿 수 |
| sortOrder | number | Y | **[관리자]** |

### Language
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| code | LanguageCode | Y | `?lang=` |
| name | string | Y | HTML, React, Next.js, Vue, Nuxt, PHP, Laravel, Java (Spring), Java (JSP), ASP.NET, WordPress, 그누보드 |
| group | LanguageGroup | Y | |
| iconKey | string | Y | |
| skinCount | number | Y | 이 언어 `released` 버전을 가진 공개 템플릿 수 |
| sortOrder | number | Y | **[관리자]** |

### Platform
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| code | PlatformCode | Y | |
| name | string | Y | 독립 호스팅, 카페24, 고도몰, 메이크샵, 아임웹 |
| skinCount | number | Y | |

### LicenseType
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| code | LicenseCode | Y | |
| name | string | Y | 개인용 / 상업용 / 확장(에이전시) |
| summary | string[] | Y | 선택 카드 2~3줄 |
| maxSites | number \| null | Y | null=무제한 |
| commercialUse | boolean | Y | |
| clientDelivery | boolean | Y | 클라이언트 납품 가능 |
| resaleAllowed | boolean | Y | 항상 false(가정) |
| updateMonths | number \| null | Y | 업데이트 제공 기간(개월), null=평생 — 안내용 |
| supportMonths | number \| null | Y | 지원 기간 — 안내용 |
| sortOrder | number | Y | **[관리자]** |

### LicenseOption (템플릿 × 라이선스 기준가)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| licenseCode | LicenseCode | Y | 한 템플릿 안에서 유일 |
| basePrice | number | Y | 기준가 **[관리자]** |
| listPrice | number \| null | Y | 할인 전 기준가(할인 없으면 null) **[관리자]** |
| isAvailable | boolean | Y | false면 선택 불가 **[관리자]** |

### Skin (목록 카드)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| slug | string | Y | 유일 |
| title | string | Y | |
| tagline | string | Y | |
| categoryId / categorySlug / categoryName | string | Y | 업종 |
| thumbnailUrl | string | Y | 16:10 |
| hoverImageUrl | string \| null | Y | |
| languages | LanguageCode[] | Y | `released` 버전 언어 |
| platforms | PlatformCode[] | Y | 전 버전 합집합 |
| isResponsive | boolean | Y | |
| minBasePrice | number | Y | `isAvailable` 라이선스 중 최저 기준가 |
| minListPrice | number \| null | Y | 최저 조합 할인 전 가격 |
| popularityScore | number | Y | 인기순 정렬 키(조회·문의 수 기반, 서버 계산) — 화면 표시 안 함 |
| isBest | boolean | Y | **[관리자]** |
| releasedAt | string | Y | NEW 배지(30일) |
| lastUpdatedAt | string | Y | 전 버전 최신 SkinVersion.releasedAt, UPDATE 배지(14일) |
| status | SkinStatus | Y | **[관리자]** |

### SkinDetail (= Skin + 아래)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| description | string | Y | sanitize HTML **[관리자]** |
| features | `{ title: string; text: string; iconKey: string \| null }[]` | Y | **[관리자]** |
| supportedBrowsers | string[] | Y | **[관리자]** |
| licenseOptions | LicenseOption[] | Y | 스킨 단위(언어 무관) |
| images | SkinImage[] | Y | |
| demos | SkinDemo[] | Y | 0개 가능 |
| variants | SkinVariant[] | Y | 1개 이상 |
| languageRequestStats | LanguageRequestStat[] | Y | |

### SkinImage
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| url | string | Y | |
| alt | string | Y | |
| device | ImageDevice \| null | Y | |
| variantId | string \| null | Y | 언어 버전 전용 스크린샷이면 id |
| isHighlight | boolean | Y | 상세 소개 섹션 대표 연출 이미지(잉크 번짐 리빌 후보) — 스킨당 최대 1개 **[관리자]** |
| sortOrder | number | Y | **[관리자]** |

### SkinDemo
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | `?demo=` |
| label | string | Y | |
| url | string | Y | 외부 데모 URL |
| variantId | string \| null | Y | null=공통 데모 |
| allowIframe | boolean | Y | false면 새 창 전용 **[관리자]** |
| sortOrder | number | Y | **[관리자]** |

선택 규칙: `variantId === 선택 id` 데모가 있으면 그 목록, 없으면 `variantId === null` 목록.

### SkinVariant (언어 버전 — 파일·데모·버전 로그 구분 전용, 가격 없음)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| skinId | string | Y | |
| languageCode | LanguageCode | Y | 템플릿 안에서 유일 |
| frameworkLabel | string \| null | Y | 예 "Spring Boot 3 · Thymeleaf" **[관리자]** |
| requirements | string[] | Y | 예 `["PHP 8.1+"]` **[관리자]** |
| platforms | PlatformCode[] | Y | **[관리자]** |
| techTags | string[] | Y | **[관리자]** |
| includedFiles | string[] | Y | **[관리자]** |
| status | VariantStatus | Y | **[관리자]** |
| isDefault | boolean | Y | `released` 중 정확히 1개 **[관리자]** |
| latestVersion | SkinVersion \| null | Y | `coming_soon`이면 null |
| recentVersions | SkinVersion[] | Y | 최신 3개 |
| releasedAt | string \| null | Y | |
| sortOrder | number | Y | **[관리자]** |

### SkinVersion (업데이트 로그)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| variantId | string | Y | |
| version | string | Y | semver, variant 안 유일 |
| releasedAt | string | Y | |
| compatibilityNote | string \| null | Y | |
| changes | `{ type: ChangeType; text: string }[]` | Y | 1개 이상 |

(배포 파일 `fileName`/`fileSize`/다운로드는 §7 [보류] — 파일 전달은 계약·납품으로 사이트 밖에서 처리.)

### RecentUpdate
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| skinSlug / skinTitle / thumbnailUrl | string | Y | |
| variantId | string | Y | |
| languageCode | LanguageCode | Y | |
| version | string | Y | |
| releasedAt | string | Y | |
| firstChange | string | Y | |

### LanguageRequest (비회원, 이메일 기반)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| skinId / skinSlug | string | Y | |
| languageCode | LanguageCode \| null | Y | 목록에 없으면 null |
| customLanguage | string \| null | Y | 2~30자 |
| email | string | Y | 출시 알림 수신. 응답에서는 마스킹(`ab***@gmail.com`) |
| note | string \| null | Y | 200자 |
| status | LanguageRequestStatus | Y | **[관리자]** |
| createdAt | string | Y | |

제약: (skinId, email, languageCode|customLanguage) 유일 → 중복 409 `ALREADY_REQUESTED`. `released` 언어는 400 `LANGUAGE_RELEASED`.

### LanguageRequestStat
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| languageCode | LanguageCode | Y | 템플릿에 없거나 `coming_soon`인 언어 전부(0 포함) |
| count | number | Y | |

### Inquiry (통합 문의 — 비회원)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| inquiryNumber | string | Y | `IQ{yyyyMMdd}-{4자리}` |
| type | InquiryType | Y | |
| group | InquiryGroup | Y | 서버 파생 |
| contact | `{ name: string; email: string; phone: string \| null; companyName: string \| null }` | Y | 제작·견적 계열 phone 필수 |
| title | string | Y | 2~100자 |
| content | string | Y | 10~3000자 |
| attachments | `{ name: string; size: number; url: string \| null }[]` | Y | 최대 3·각 10MB, mock url null |
| production | `{ industrySlug: string \| null; languageCode: LanguageCode \| null; customLanguage: string \| null; templateSlug: string \| null; planCode: string \| null; featureSlugs: string[]; budgetRange: BudgetRange \| null; desiredLaunchDate: string \| null; currentSiteUrl: string \| null } \| null` | Y | group=`production`일 때. `custom_dev`: templateSlug + (languageCode 또는 customLanguage) 필수 |
| template | `{ skinSlug: string; variantId: string \| null; languageCode: LanguageCode \| null; licenseCode: LicenseCode \| null; scope: TemplateRequestScope; basePriceSnapshot: number \| null } \| null` | Y | type=`template_custom`일 때 필수. basePriceSnapshot=문의 시점 기준가(서버 기록) |
| reference | `{ skinSlug: string \| null; contractNumber: string \| null } \| null` | Y | `license`/`technical`일 때 |
| status | InquiryStatus | Y | **[관리자]** |
| answer | `{ content: string; createdAt: string } \| null` | Y | **[관리자]** |
| createdAt | string | Y | |

### InquiryLookupResult (조회 응답 — Inquiry의 공개 부분)
`Pick<Inquiry, 'inquiryNumber' | 'type' | 'title' | 'content' | 'attachments' | 'status' | 'answer' | 'createdAt'> & { templateTitle: string | null }` — 연락처·이메일은 응답하지 않는다.

### PricingPlan
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| code | string | Y | 유일, `?plan=` |
| kind | PricingPlanKind | Y | |
| name | string | Y | |
| summary | string | Y | |
| priceType | PriceType | Y | |
| price | number \| null | Y | 예상 비용. `quote`면 null |
| unitLabel | string \| null | Y | "페이지당", "월" |
| duration | string \| null | Y | "3~4주" |
| includes | string[] | Y | |
| isRecommended | boolean | Y | |
| sortOrder | number | Y | |

전 필드 **[관리자]**. 웹 응답은 활성 플랜만.

### FeatureGroup / ServiceFeature
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| FeatureGroup.slug | string | Y | 앵커 `#{slug}` |
| FeatureGroup.name | string | Y | 콘텐츠 관리 / 회원·고객 / 예약·신청 / 마케팅 / 운영 도구(가정) |
| FeatureGroup.description | string | Y | |
| FeatureGroup.imageUrl | string \| null | Y | 그룹 대표 스크린샷(리빌 후보) |
| FeatureGroup.sortOrder | number | Y | |
| ServiceFeature.id / slug | string | Y | slug = 앵커·`?feature=` |
| ServiceFeature.groupSlug | string | Y | |
| ServiceFeature.name / summary | string | Y | |
| ServiceFeature.description | string \| null | Y | sanitize HTML |
| ServiceFeature.iconKey | string | Y | |
| ServiceFeature.imageUrl | string \| null | Y | |
| ServiceFeature.availability | FeatureAvailability | Y | |
| ServiceFeature.languages | LanguageCode[] | Y | 빈 배열=언어 무관 |
| ServiceFeature.isHighlighted | boolean | Y | 메인 6개 |
| ServiceFeature.sortOrder | number | Y | |

전 필드 **[관리자]**. 제작방법 ProcessStep은 프론트 정적 상수(계약 밖).

### Notice / NoticeDetail
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| category | NoticeCategory | Y | |
| title | string | Y | |
| isPinned | boolean | Y | **[관리자]** |
| createdAt | string | Y | |
| content (Detail) | string | Y | sanitize HTML |
| prev / next (Detail) | `{ id: string; title: string } \| null` | Y | |

### FaqCategory / Faq
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| FaqCategory.code | FaqCategoryCode | Y | |
| FaqCategory.name | string | Y | |
| FaqCategory.sortOrder | number | Y | **[관리자]** |
| Faq.id | string | Y | |
| Faq.categoryCode | FaqCategoryCode | Y | |
| Faq.question | string | Y | |
| Faq.answer | string | Y | sanitize HTML |
| Faq.sortOrder | number | Y | **[관리자]** |

### PolicyDocument
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| type | PolicyType | Y | |
| title | string | Y | |
| version | string | Y | |
| effectiveDate | string | Y | |
| content | string \| null | Y | null=준비 중 **[관리자]** |
| versions | `{ version: string; effectiveDate: string }[]` | Y | |

### HomeBanner
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| placement | `'hero'` | Y | |
| title / subtitle | string / string \| null | Y | |
| skinSlug | string \| null | Y | |
| imageUrl / mobileImageUrl | string / string \| null | Y | |
| ctaLabel / ctaUrl | string \| null | Y | |
| sortOrder / startsAt / endsAt / isActive | | Y | **[관리자]** (웹 응답은 활성·기간 내만) |

### SiteInfo
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| SiteInfo.siteName | string | Y | "다잇누몰" |
| SiteInfo.companyName / ceoName / businessNumber / address | string | Y | **[관리자]** |
| SiteInfo.csPhone / csEmail / csHours | string | Y | **[관리자]** |
| SiteInfo.avgResponseHours | number | Y | **[관리자]** |
| SiteInfo.privacyOfficer | `{ name: string; email: string }` | Y | **[관리자]** |

(통신판매업 신고번호는 온라인 결제가 없어 제외 — OQ-N2에서 확인.)

## 3. 입력 타입

| 이름 | 필드 |
|---|---|
| LanguageRequestInput | `languageCode: LanguageCode \| null, customLanguage: string \| null, email, note: string \| null, agreePrivacy: true` |
| InquiryInput | `type, contact{name,email,phone,companyName}, title, content, attachments[{name,size}], production?, template?{skinSlug, variantId, languageCode, licenseCode, scope}, reference?, agreePrivacy: true, website: string(허니팟 — 비어 있어야 함)` |
| InquiryLookupInput | `inquiryNumber, email` |

## 4. 엔드포인트 (전부 공개)

### 카탈로그
| 메서드·경로 | 요청 | 200 응답 | 사용처(화면 · 훅) |
|---|---|---|---|
| `GET /api/skins` | query: `category?`(웹 `industry` 매핑), `lang?`(콤마, OR), `platform?`(콤마, OR), `price?`(PriceRange), `responsive?`(`1`), `sort?`(기본 popular), `q?`(제목·태그라인·언어명·업종명), `page?`(1), `pageSize?`(24, 최대 48, `0`이면 items 빈 배열+total만) | `Paginated<Skin> & { facets: { categories: {slug,count}[]; languages: {code,count}[]; platforms: {code,count}[] } }` — facet은 해당 축 제외 나머지 필터 적용 | 템플릿 목록 · `useSkins(query)`; 메인 업종별 탭 · `useSkins({category,sort:'popular',pageSize:8})`; 헤더 검색 · `useSkinSearch(q)`(5); 문의하기 참고 템플릿 · `useSkinSearch(q)`(8); 404·목록 빈 상태 추천 · `useSkins({sort:'popular',pageSize:4})`; About Us 최저 기준가 · `useSkins({sort:'price_asc',pageSize:1})` |
| `GET /api/skins/:slug` | — | `SkinDetail` (404: 없음/draft/hidden) | 템플릿 상세·데모 미리보기·문의하기 템플릿 요약 카드 · `useSkin(slug)` 캐시 `['skin', slug]` |
| `GET /api/skins/:slug/versions?variantId=` | variantId 필수 | `{ items: SkinVersion[] }` 최신순 | 상세 업데이트 로그 전체 보기·언어 전환 · `useSkinVersions` |
| `GET /api/skins/:slug/related?limit=4` | — | `{ items: Skin[] }` | 상세 관련 템플릿 · `useRelatedSkins` |
| `GET /api/categories` | — | `{ items: Category[] }` | 헤더 메가메뉴, 메인 업종 탭, 목록 업종 탭, 문의하기 업종 Select · `useCategories` |
| `GET /api/languages` | — | `{ items: Language[] }` | 헤더 메가메뉴, 목록 필터, 상세, 언어 요청 모달, 서비스소개 매트릭스, 문의하기 희망 언어 · `useLanguages` |
| `GET /api/platforms` | — | `{ items: Platform[] }` | 목록 필터 · `usePlatforms` |
| `GET /api/license-types` | — | `{ items: LicenseType[] }` | 상세 선택 패널·비교 모달, 문의하기 템플릿 요약, 라이선스 정책 · `useLicenseTypes` |

### 언어 요청
| 메서드·경로 | 요청 | 200 응답 | 사용처 |
|---|---|---|---|
| `POST /api/skins/:slug/language-requests` | LanguageRequestInput | `LanguageRequest`(email 마스킹) — 409 `ALREADY_REQUESTED`, 400 `LANGUAGE_RELEASED` | 상세 언어 요청 모달 · `useCreateLanguageRequest` (invalidate `['skin', slug]`) |

### 제작 대행 콘텐츠
| 메서드·경로 | 요청 | 200 응답 | 사용처 |
|---|---|---|---|
| `GET /api/pricing-plans` | query: `kind?`(콤마 다중) | `{ items: PricingPlan[] }` | 메인(production), About Us(production,option,seo,maintenance), 문의하기 요금제 Select · `usePricingPlans(kind)` |
| `GET /api/service-features` | query: `highlighted?`(`1`) | `{ groups: FeatureGroup[]; items: ServiceFeature[] }` | 서비스소개, 메인(highlighted), 문의하기 필요 기능 · `useServiceFeatures` |

### 문의
| 메서드·경로 | 요청 | 200 응답 | 사용처 |
|---|---|---|---|
| `POST /api/inquiries` | InquiryInput | `Inquiry`(contact 포함 — 제출자 본인 화면용) — 400 VALIDATION + fieldErrors; 허니팟 채워짐 → 200 가짜 성공 | 문의하기 · `useCreateInquiry` |
| `POST /api/inquiries/lookup` | InquiryLookupInput | `InquiryLookupResult` — 404 `NOT_FOUND`(불일치·없음 동일), 429 `TOO_MANY_REQUESTS`(같은 접수번호 5회 실패/10분) | 문의 조회 · `useInquiryLookup`(mutation — 캐시하지 않음) |

### 고객지원 · 사이트
| 메서드·경로 | 요청 | 200 응답 | 사용처 |
|---|---|---|---|
| `GET /api/faqs` | query: `category?`(콤마 다중), `q?`, `limit?` | `{ items: Faq[] }` | FAQ, About Us FAQ(production,seo,maintenance, 8), 문의하기 보조 패널(5) · `useFaqs` |
| `GET /api/faq-categories` | — | `{ items: FaqCategory[] }` | FAQ · `useFaqCategories` |
| `GET /api/notices` | query: `page?`, `pageSize?`(10), pinned 먼저 | `Paginated<Notice>` | 공지 목록 · `useNotices` |
| `GET /api/notices/:noticeId` | — | `NoticeDetail` | 공지 상세 · `useNotice` |
| `GET /api/policies/:policyType` | query: `version?` | `PolicyDocument` | 약관/정책, 문의하기·언어 요청 개인정보 동의 "보기" · `usePolicy` |
| `GET /api/home/banners?placement=hero` | — | `{ items: HomeBanner[] }` | 메인 히어로, 헤더 메가메뉴 대표 카드 · `useHomeBanners` |
| `GET /api/site/info` | — | `SiteInfo` | 푸터, 메인 CTA 띠, 문의하기 · `useSiteInfo` |

## 5. 캐시 키
- `['skin', slug]` — 언어 요청 생성 시 invalidate(languageRequestStats).
- `['skins', query]` — 필터 변경 시 `keepPreviousData`.
- 그 외 조회는 staleTime 5분(콘텐츠성). 문의 생성·조회는 캐시하지 않는다.

## 6. 변경 이력
| 날짜 | 변경 | 영향 사용처 |
|---|---|---|
| 2026-09-27 | 사용자 결정 반영(OQ-0 문의 중심 / OQ-A 동일가 / OQ-1 3종). 회원·구매 엔티티·엔드포인트를 §7 [보류]로 이동. `LicenseOption`을 `SkinVariant`→`SkinDetail`로 이동, `price`→`basePrice`, `Skin.minPrice`→`minBasePrice`, `salesCount`·`ratingAverage`·`reviewCount`·`isWishlisted`·`ownedLicenses` 제거, `popularityScore` 추가. `SkinVersion` 파일 필드 제거. `SkinImage.isHighlight`, `FeatureGroup.imageUrl`, `Testimonial`, `InquiryLookupResult`, `TemplateRequestScope`, `InquiryStatus` 추가. `LanguageRequest`를 이메일 기반으로(`notify`·`myRequestId`·`requestedByMe` 제거). InquiryType에서 purchase/download/refund 제거. PolicyType에서 refund 제거. mock 키 v2 | 전 화면 |
| 2026-09-27 | GNB 반영: PricingPlan·FeatureGroup·ServiceFeature, 통합 Inquiry, Category=업종, SiteStats.completedProjects·SiteInfo.avgResponseHours | 메인, About Us, 서비스소개, 문의하기 |
| 2026-09-27 | 초안: 개발 지원언어로 SkinVariant/Language/LanguageRequest 도입 | 전 화면 |
| 2026-09-27 | 사용자 요청 "메인페이지 고객후기 제외" — `Testimonial` 엔티티와 `GET /api/testimonials`를 §7 [보류]로 이동 | 메인 |
| 2026-09-27 | 사용자 요청 "신뢰지표 제거" — 메인에서 `SiteStats` 사용 제거(푸터만 사용) | 메인 |
| 2026-09-27 | 사용자 지정 메인 구성(히어로/업종별 탭/이렇게 만듭니다/운영까지 편하게/마무리 문의) — 메인에서 `Language`·`RecentUpdate` 사용 제거, `GET /api/skins/updates/recent` §7 [보류]로 이동. 업종 탭은 기존 `GET /api/skins?category=&sort=popular&pageSize=8` 재사용 | 메인 |
| 2026-09-27 | 사용자 요청 — 푸터 신뢰 요약 제거로 `SiteStats`·`GET /api/site/stats` 사용처 0 → §7 [보류]로 이동 | 푸터 |

## 7. [보류] 웹 미사용 — 커머스 재도입 시 참조
OQ-0 결정으로 웹 1단계에서 **구현하지 않는다**. 재도입 시 이 목록을 출발점으로 이전 초안 설계(변경 이력 2026-09-27 초안)를 복원한다.
- 엔티티: `User`, `Session`, `Cart`, `CartItem`, `CheckoutPreview`, `PaymentMethod`, `Order`, `OrderItem`, `Payment`, `License`, `LicenseDetail`, `DownloadLog`, `DownloadTicket`, `MyPageSummary`, `Review`, `ReviewSummary`, `ReviewableLicense`, `SkinQuestion`, 찜(Wishlist).
- 엔드포인트: `/api/auth/*`, `/api/cart*`, `/api/checkout/preview`, `/api/payment-methods`, `/api/orders*`, `/api/me/*`, `/api/skins/:slug/reviews`, `/api/reviews/featured`, `/api/skins/:slug/questions`.
- 필드: `SkinVersion.fileName`/`fileSize`/`guideUrl`, `Skin.salesCount`/`ratingAverage`/`reviewCount`, `LicenseType`의 다운로드 제한 개념.
- 관리자(2단계)가 라이선스 판매·납품 파일을 관리해야 하면(예: 문의 → 계약 후 파일 전달) 그때 `License`/`SkinVersion` 파일 필드를 관리자 전용으로 되살린다(OQ-N1).

### [보류] Testimonial (메인 고객 후기 — 사용자 요청으로 제외, 2026-09-27)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| clientLabel | string | Y | 예 "○○치과 · 병원·의료" |
| authorMaskedName | string | Y | "김*현 원장" |
| content | string | Y | |
| rating | 1\|2\|3\|4\|5 \| null | Y | 표시 선택 |
| skinSlug | string \| null | Y | 관련 템플릿 링크 |
| imageUrl | string \| null | Y | 완성 사이트 캡처 |
| isFeatured | boolean | Y | |
| createdAt | string | Y | |

전 필드 **[관리자]**.

엔드포인트(보류): | `GET /api/testimonials` | query: `featured?`(`1`), `limit?` | `{ items: Testimonial[] }` | 메인 고객 후기 · `useTestimonials` |

### [보류] 최근 업데이트 목록 (메인 섹션 삭제, 2026-09-27)
엔드포인트(보류): | `GET /api/skins/updates/recent?limit=5` | — | `{ items: RecentUpdate[] }` | 메인 · `useRecentUpdates` | — `RecentUpdate` 엔티티 정의는 위 본문에 유지(상세 업데이트 로그와 필드 공유 여부는 구현 시 확인)

### [보류] SiteStats (메인 신뢰 지표·푸터 신뢰 요약 제거, 2026-09-27)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| totalSkins | number | Y | |
| completedProjects | number | Y | 제작 완료 건수 **[관리자]** |
| languageCount | number | Y | 템플릿이 있는 언어 수 |
| updatesThisMonth | number | Y | |
엔드포인트(보류): | `GET /api/site/stats` | — | `SiteStats` | 푸터 · `useSiteStats` |
