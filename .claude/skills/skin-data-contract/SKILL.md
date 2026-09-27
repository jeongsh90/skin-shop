---
name: skin-data-contract
description: "다잇누몰의 데이터 계약(엔티티 타입, API 엔드포인트 명세 api-contract.md), 프론트 API 클라이언트 인터페이스, 서버 없이 동작하는 mock 어댑터(localStorage 기반 시드 데이터)를 설계·구현하는 스킬. 서버는 마지막 단계이므로 모든 화면 데이터는 이 계층을 통해야 한다. '타입 정의', '데이터 구조', 'mock 데이터', '더미 데이터', 'API 명세', '엔티티 추가', '필드 추가', '어댑터 교체' 요청 시 반드시 사용."
---

# Skin Data Contract

서버를 마지막에 붙이기 위한 핵심 장치. **화면 → 훅 → API 클라이언트 인터페이스 → 어댑터(mock | http)** 구조를 처음부터 고정한다. 페이지가 mock 배열을 직접 import하면 서버 연결 때 모든 페이지를 다시 써야 하므로 금지한다.

## 파일 구조
```
src/
  types/            # 엔티티 타입 (계약의 TS 버전)
  lib/api/
    client.ts       # ApiClient 인터페이스 + 현재 어댑터 export
    mock-adapter.ts # localStorage 기반 구현 (지연·에러 시뮬레이션 포함)
    http-adapter.ts # 3단계에서 backend가 구현
    seed/           # 시드 데이터 (스킨·카테고리·후기 등)
  hooks/queries/    # TanStack Query 훅 (useSkins, useSkin, useCart …)
_workspace/api-contract.md   # 사람이 읽는 계약 원본
```

## api-contract.md 형식
```markdown
## Skin
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | Y | |
| slug | string | Y | URL용, 유일 |
| price | number | Y | 원 단위 정수 |
...

## GET /api/skins
- query: category?, q?, sort?(popular|newest|price_asc|price_desc), page?, pageSize?
- 200: { items: Skin[], total: number, page: number, pageSize: number }
- 사용처: SkinListPage(useSkins), HomePage(useSkins sort=popular)
```
- **응답 래핑 형태를 명시한다**(`{items,total}` vs 배열). 가장 흔한 경계면 버그가 여기서 난다.
- 필드명은 camelCase, 금액은 원 단위 정수, 날짜는 ISO 문자열로 통일.
- 각 엔드포인트에 "사용처(화면·훅)"를 적는다 — QA가 1:1 매핑 검증에 쓴다.
- 관리자 단계에서 필드를 바꾸면 변경 이력과 영향받는 웹 사용처를 같이 적는다.

## ApiClient 인터페이스 예
```ts
export interface ApiClient {
  skins: {
    list(q: SkinListQuery): Promise<Paginated<Skin>>;
    get(slug: string): Promise<SkinDetail>;
  };
  cart: { get(): Promise<Cart>; add(i: CartItemInput): Promise<Cart>; remove(id: string): Promise<Cart> };
  auth: { login(i: LoginInput): Promise<Session>; me(): Promise<User | null>; logout(): Promise<void> };
  // admin.* 는 2단계에서 추가
}
export const api: ApiClient =
  import.meta.env.VITE_API_MODE === 'http' ? httpAdapter : mockAdapter;
```

## mock 어댑터 규칙
- 저장소는 localStorage 한 곳(`daitnu:mock:v1`)에 두고 **웹과 관리자가 같은 저장소를 공유**한다 — 관리자에서 등록한 스킨이 웹에 뜨는지 서버 없이 검증할 수 있다.
- 150~400ms 랜덤 지연을 넣어 로딩 상태가 실제로 보이게 한다. `?mockError=1` 등으로 에러 상태도 재현 가능하게 한다.
- 스키마를 바꾸면 버전 키를 올리고 시드를 재생성한다(구버전 데이터로 화면이 깨지는 것 방지).
- 시드 데이터는 현실적으로: 실제 있을 법한 스킨명·설명·가격대·후기. "Lorem ipsum", "상품 1" 같은 값은 화면 품질 판단을 흐리므로 쓰지 않는다. 이미지는 `public/mock/` 로컬 파일 또는 플레이스홀더 서비스(사용자 확인).
- mock 인증: 테스트 계정(`user@test.com`/`admin@test.com`)을 시드에 두고 역할로 관리자 접근을 구분한다.

## 훅 규칙
- 서버 상태는 TanStack Query로 관리(캐시 키: `['skins', query]`). 변경 후 관련 키 invalidate.
- 화면은 훅만 import한다. `api`를 직접 부르는 곳은 훅과 mutation 뿐이다.
