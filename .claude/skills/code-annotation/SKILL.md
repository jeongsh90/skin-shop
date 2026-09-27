---
name: code-annotation
description: "다잇누몰 코드 주석 규칙 — 작업 파일(.tsx/.ts/.css/.json/설정 파일 등)에는 주석을 달지 않고, 설명·의도·변경 사유·출처는 같은 폴더의 같은 이름 .md 파일(예: Header.tsx → Header.md)에 적는다. 코드를 작성·수정하는 모든 작업(프론트/백엔드/설정)에서 반드시 적용. '주석', '설명 달아', '문서화', '코드 설명' 요청 시에도 사용."
---

# Code Annotation (사용자 지정 규칙, 2026-09-27)

## 규칙
1. **작업 파일에는 주석을 넣지 않는다.** `//`, `/* */`, `{/* */}`, `<!-- -->`, CSS 주석, `@ts-*`/`eslint-disable` 설명 주석 모두 해당.
2. **설명은 같은 폴더의 같은 이름 `.md` 파일에 적는다.** 확장자만 `.md`로 바꾼다.
   - `src/components/web/Header.tsx` → `src/components/web/Header.md`
   - `src/lib/api/mock-adapter.ts` → `src/lib/api/mock-adapter.md`
   - `vite.config.ts` → `vite.config.md`
3. 같은 폴더에 이름이 같고 확장자만 다른 파일이 여럿이면(`Hero.tsx`, `Hero.css`) md 하나(`Hero.md`)에 파일별 섹션으로 나눠 적는다.
4. 파일을 이름 변경·이동·삭제하면 짝 md도 함께 옮기거나 지운다. 짝 없는 md가 남지 않게 한다.
5. 설명할 게 없는 단순 파일(re-export만 하는 index.ts, 자명한 타입 파일)은 md를 만들지 않아도 된다. 의도·제약·우회·출처가 있는 파일만 만든다.

## 예외
- 문법상 주석이 필수인 경우만 허용: 파일 최상단 지시어(`'use client'` 같은 문자열 지시어는 주석이 아니므로 해당 없음), 벤더 파일의 `// @ts-nocheck`처럼 도구가 요구하는 pragma. 이때도 이유는 md에 적는다.
- shadcn·커뮤니티 레지스트리가 설치한 파일에 원래 들어있던 주석은 그대로 둔다(우리가 작성한 것이 아님). 우리가 수정한 부분의 설명은 md에 적는다.
- JSON 등 주석 불가 형식은 원래대로.

## md 형식
```markdown
# Header.tsx

## 역할
사용자 웹 공통 헤더. GNB 4개 메뉴 + 유틸 영역(테마 토글·로그인·장바구니).

## 주요 결정
- 스크롤 60px 이후 배경 불투명 전환: Lenis `useLenis` 콜백 사용(scroll 이벤트 직접 구독 금지 — 인스턴스 규칙)

## 변경 이력
- 2026-09-27 초기 작성
```
- 줄 번호 대신 함수/컴포넌트/섹션 이름으로 가리킨다(코드가 바뀌어도 설명이 어긋나지 않게).
- 레지스트리 설치물은 `## 출처`에 설치 명령·레지스트리 URL·정규화 내역을 적는다.

## 점검 (QA 공용)
- `grep -rnE "^\s*(//|/\*|\*|\{/\*)" src server --include=*.ts --include=*.tsx` 결과에서 벤더 원본·pragma를 제외하면 0건이어야 한다.
- CSS: `grep -rn "/\*" src --include=*.css` 도 동일.
- 이름 바뀐 파일의 짝 md 누락/고아 md 여부.
