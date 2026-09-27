---
name: react-shadcn-setup
description: "다잇누몰 React 프로젝트(Bun + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + React Router + TanStack Query) 스캐폴드, 폴더 구조, 사용자 웹/관리자 라우트 분리, shadcn 공식 컴포넌트 및 커뮤니티 레지스트리(ui.shadcn.com/docs/directory) 설치 규칙을 안내. '프로젝트 생성', '초기 세팅', 'shadcn 설치', 'shadcn add', '레지스트리 설치', '컴포넌트 추가', '라우트 추가', '빌드 에러' 요청 시 반드시 사용."
---

# React + shadcn Setup

## 스택 결정 (기본안)
- 패키지 매니저/런타임: **Bun** (설치됨)
- 번들러: **Vite + React + TypeScript** — SEO가 중요한 상품 페이지는 서버 단계에서 프리렌더/SSR 검토 항목으로 남긴다(open-question)
- 스타일: Tailwind CSS v4(`@tailwindcss/vite`) + shadcn/ui(CSS 변수 테마)
- 라우팅: React Router(데이터 라우터), 관리자 트리는 `lazy()`로 분리해 사용자 번들에 관리자 코드가 섞이지 않게 한다
- 서버 상태: TanStack Query / 폼: react-hook-form + zod / 모션: GSAP(+ScrollTrigger), Lenis
- 폰트: Pretendard(가변 웹폰트, self-host 권장)

## 스캐폴드 절차
```bash
bun create vite . --template react-ts   # 빈 폴더에서
bun add -d tailwindcss @tailwindcss/vite @types/node
bun add react-router @tanstack/react-query lenis gsap react-hook-form zod @hookform/resolvers
```
1. `vite.config.ts`: `tailwindcss()` 플러그인 + `resolve.alias { '@': path.resolve(__dirname, './src') }`
2. `tsconfig.json`과 `tsconfig.app.json` 둘 다 `compilerOptions.baseUrl: "."`, `paths: { "@/*": ["./src/*"] }` (shadcn init이 루트 tsconfig를 읽는다)
3. `src/index.css`: `@import "tailwindcss";` 
4. `bunx --bun shadcn@latest init` → 이후 컴포넌트는 `bunx --bun shadcn@latest add button card …`
5. `package.json` scripts에 `typecheck: "tsc -b --noEmit"` 추가
6. 패키지명은 ASCII(`daitnumall` 등)로 — 한글 폴더명이어도 package name은 한글 불가

## 폴더 구조
```
src/
  app/
    router.tsx
    web/      layouts/WebLayout.tsx, pages/*
    admin/    layouts/AdminLayout.tsx, pages/*   (lazy)
  components/
    ui/          # shadcn 설치물 (직접 수정 시 변경 사유는 같은 이름 .md에)
    registry/    # 커뮤니티 레지스트리 설치물 (출처는 같은 이름 .md에)
    web/ admin/ shared/
  lib/ (api/, smooth-scroll/, utils.ts)
  hooks/  types/  styles/ (tokens.css, typography.css)
```

## 컴포넌트 소싱 규칙
1. **shadcn 공식**에 있으면 그것을 설치해 쓴다(Button, Card, Dialog, Sheet, Tabs, Select, Carousel, Pagination, Table, Form, Sonner…). 비슷한 걸 직접 만들지 않는다.
2. 공식에 없거나 쇼케이스급 비주얼(히어로 모션, 마퀴, 3D 카드 등)이 필요하면 **커뮤니티 레지스트리**(https://ui.shadcn.com/docs/directory) 후보를 designer와 정리해 **사용자 승인 후** 설치:
   ```bash
   bunx --bun shadcn@latest add @{registry}/{component}
   # 레지스트리 등록이 필요한 경우 components.json "registries"에 추가
   ```
3. 설치 중 "기존 파일 덮어쓰기?"(예: button.tsx) 프롬프트는 **거부**가 기본. 커스터마이즈된 공용 컴포넌트가 초기화되면 전역 스타일이 깨진다. 필요하면 `--dry-run`/diff로 확인.
4. 레지스트리 컴포넌트가 하드코딩된 폰트(Inter/Mono)·고정 색·자체 wrapper 여백을 갖고 오면 토큰(Pretendard, CSS 변수, className 전달)으로 정규화한다.
5. 설치한 레지스트리는 `_workspace/{stage}/03_frontend_progress.md`의 "설치 목록"에 명령어와 함께 기록한다.

## 완료 확인
- `bun run typecheck`, `bun run build` 통과
- `bun run dev`로 실제 페이지 열어 콘솔 에러 0
