---
name: skin-server-integration
description: "다잇누몰 3단계(마지막) 서버 구축·연결 스킬 — 로컬 mock으로 완성된 사용자 웹/관리자 프론트에 실제 API 서버·DB·인증·스킨 파일 보호 다운로드·결제대행 연동을 붙이고 http 어댑터로 교체한 뒤 배포/도메인 연결까지 수행. '서버 연결', '백엔드 만들어', 'DB 연결', 'API 구현', '결제 붙여', '배포', '도메인', '호스팅' 요청 시 사용. 웹/관리자 화면 작업 단계에서는 사용하지 않는다."
---

# Skin Server Integration

## 착수 전 사용자 결정 (기본안 제시 후 확인)
| 항목 | 기본안 | 대안 |
|---|---|---|
| 서버 | Bun + Hono (`server/`, 같은 저장소) | Supabase(BaaS), Node+NestJS |
| DB | SQLite(bun:sqlite)+Drizzle로 시작 → 운영 시 PostgreSQL | Supabase Postgres |
| 인증 | 세션 쿠키(httpOnly, SameSite=Lax) + 관리자 역할 | JWT, 소셜 로그인 |
| 파일 | 스킨 zip은 비공개 스토리지(로컬 `storage/` → S3/R2) + 구매자 검증 후 서명 URL(만료) | |
| 결제 | 토스페이먼츠/포트원 테스트 모드 | |
| 배포 | 사용자 결정(VPS, Fly.io, Railway, Vercel+서버 분리, Tailscale Funnel 임시 공개 등) | |
비용·계정이 걸리는 항목은 사용자가 고르기 전까지 구현하지 않는다.

## 구현 순서
1. `_workspace/api-contract.md`를 읽고 엔드포인트를 리소스별로 묶는다: auth → skins(공개 조회) → cart/orders → payments → downloads/licenses → admin.*
2. 리소스 하나 구현할 때마다: 응답 shape을 계약과 동일하게(래핑 형태 포함) → `http-adapter.ts`의 해당 메서드 구현 → skin-qa 교차검증.
3. 시드: mock 시드 데이터(`src/lib/api/seed/`)를 DB 시드 스크립트로 재사용해 화면이 동일하게 보이는지 비교.
4. `VITE_API_MODE=http`로 전환, dev에서 Vite proxy(`/api` → 서버 포트)로 CORS 없이 연결.

## 반드시 지킬 것
- 가격·할인·라이선스 금액은 **서버에서 재계산**한다. 클라이언트가 보낸 금액을 믿으면 조작된다.
- 결제 승인은 결제대행 서버-서버 검증(승인 API/웹훅) 후에만 주문을 `paid`로. 웹훅은 서명 검증 + 멱등 처리.
- 다운로드: 주문 상태·소유자·라이선스 확인 → 짧은 만료 URL. 원본 경로 노출 금지.
- 관리자 API는 서버 미들웨어에서 역할 검사(프론트 숨김만으로는 보안이 아님).
- 비밀값은 `.env`(커밋 금지), `.env.example`에 키 이름만.
- 입력 검증은 zod 스키마를 프론트와 공유(`src/types` 또는 `shared/`)해 이중 정의를 피한다.

## 산출물
- `_workspace/server/04_backend_progress.md` — 엔드포인트 체크리스트(구현/검증 여부)
- `_workspace/server/04_backend_deploy.md` — 실행 방법, 환경변수 목록, 배포 절차, 롤백 방법
