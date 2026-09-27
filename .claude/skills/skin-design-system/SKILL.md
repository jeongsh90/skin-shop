---
name: skin-design-system
description: "다잇누몰(스킨 판매 사이트)의 디자인 시스템 — 디자인 토큰(색·간격·반경·그림자·모션), shadcn 테마 변수 연결, Pretendard 한글 타이포그래피 스케일(자간·행간), 사용자 웹(쇼케이스형)과 관리자(고밀도 업무형) 톤 분리, 레퍼런스 분석, 커뮤니티 레지스트리 컴포넌트 선정·정규화 기준을 다룬다. '디자인', '토큰', '컬러', '폰트', '타이포', '다크모드', '레퍼런스 분석', '이 느낌으로', '고퀄리티로', 'AI스럽지 않게', '레지스트리 추천' 요청 시 반드시 사용."
---

# Skin Design System

## 레퍼런스 분석 → 브리프
레퍼런스(스크린샷/URL)가 오면 다음을 문장으로 뽑아 `02_designer_brief.md`에 적는다: 그리드(열 수·최대폭·거터), 타이포 대비(최대/본문 크기비, 굵기 대비), 여백 리듬(섹션 간격), 색 사용량(무채색 비율, 포인트 색 사용처), 이미지 처리(라운드·그림자·크롭), 모션 성격(속도·이징·스크롤 연동 여부). 픽셀을 베끼지 말고 이 원리를 적용한다. `impeccable` 스킬이 있으면 craft-floor 기준으로 자체 점검한다.

## "AI스러운" 기본 배치 피하기
- 가운데 정렬 히어로 + 3열 아이콘 카드 + 그라디언트 버튼의 반복 금지
- 모든 섹션에 같은 fade-up 등장 모션 금지 — 섹션 성격별로 다르게 하거나 없앤다
- 스탯 타일 나열 히어로, 색 border-left 콜아웃, 의미 없는 글래스모피즘 금지
- 스킨 판매 사이트이므로 **상품(스킨 스크린샷)이 주인공**: 크게, 실제 비율로, 디바이스 프레임/스크롤 미리보기 등으로 보여준다

## 토큰 구조
```css
/* src/styles/tokens.css — shadcn 변수와 연결 */
:root {
  --background: …; --foreground: …; --primary: …; --muted: …; --border: …; --ring: …;
  --radius: 0.625rem;
  --space-section: clamp(4rem, 8vw, 8rem);
  --ease-out-quart: cubic-bezier(.25,1,.5,1);
  --dur-fast: 150ms; --dur-base: 250ms; --dur-slow: 600ms;
}
[data-surface="admin"] { /* 관리자 톤 오버라이드: 채도↓, radius↓, 밀도↑ */ }
.dark { … }
```
- Tailwind v4 `@theme inline`으로 변수 노출. 컴포넌트에 hex/px 직접 사용 금지(예외: 1px 보더).
- 색은 OKLCH로 정의하고 텍스트/배경 대비 WCAG AA(본문 4.5:1) 확인.

## Pretendard 타이포 (한글 기준)
| 토큰 | 크기 | 행간 | 자간 | 굵기 |
|---|---|---|---|---|
| display | clamp(2.5rem, 6vw, 5rem) | 1.1 | -0.035em | 700 |
| h1 | 2.25rem | 1.2 | -0.03em | 700 |
| h2 | 1.75rem | 1.3 | -0.025em | 700 |
| h3 | 1.25rem | 1.4 | -0.02em | 600 |
| body-lg | 1.125rem | 1.7 | -0.01em | 400 |
| body | 1rem | 1.65 | -0.01em | 400 |
| small | 0.875rem | 1.55 | -0.005em | 400 |
| caption | 0.75rem | 1.5 | 0 | 500 |
- 한글은 큰 글씨일수록 자간을 더 좁혀야 단단해 보인다. uppercase·양수 자간은 영문 라벨에만.
- 숫자(가격·통계)는 `font-variant-numeric: tabular-nums`.
- `word-break: keep-all`로 한글 어절 단위 줄바꿈.
- 폰트: `pretendard` 가변 폰트 self-host, `font-display: swap`, `--font-sans: "Pretendard Variable", Pretendard, system-ui, sans-serif`.

## 톤 분리
- **사용자 웹**: 큰 여백, 강한 타이포 대비, 스킨 이미지 중심, 스크롤 연동 모션 적극(단, transform/opacity만).
- **관리자**: 13~14px 본문, 테이블·폼 밀도 우선, 모션 최소(상태 전환 150ms), 색은 상태 표시에만.

## 레지스트리 선정 기준 (제안서 형식)
```markdown
### {용도} — 예: 메인 히어로 스킨 쇼케이스 마퀴
| 후보 | 설치 명령 | 장점 | 우려(폰트/색 하드코딩, 의존성, 번들 크기) |
- 추천: … / 이유: …
```
- 우선 확인: 의존성(framer-motion 등 추가 패키지), 하드코딩 폰트·색, 접근성(키보드·reduced-motion), 라이선스.
- 설치 후 정규화: 폰트→`--font-sans`, 색→토큰, 자체 wrapper 여백 제거하고 className 전달.
