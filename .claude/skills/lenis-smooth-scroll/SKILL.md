---
name: lenis-smooth-scroll
description: "다잇누몰 사용자 웹페이지·관리자페이지 전 페이지에 Lenis(https://lenis.dev) 스무스 스크롤을 적용하고 GSAP ScrollTrigger와 동기화하며, 라우트 전환·모달·드롭다운·내부 스크롤 영역·앵커 이동에서 생기는 충돌을 막는 스킬. '스크롤', 'Lenis', '부드러운 스크롤', '스무스 스크롤', 'ScrollTrigger', '스크롤 애니메이션', '모달 뒤 배경 스크롤', '스크롤 버벅임' 요청 시 반드시 사용."
---

# Lenis Smooth Scroll

## 원칙
- **레이아웃이 Lenis를 소유한다.** 페이지 컴포넌트는 인스턴스를 만들지 않고 `useLenis()`로 가져다 쓴다. 인스턴스가 여러 개면 서로 휠 이벤트를 가로채 충돌한다.
- 웹과 관리자는 스크롤 구조가 달라 규칙도 다르다.

| | 사용자 웹 | 관리자 |
|---|---|---|
| 스크롤 주체 | 문서(window) — `root` 모드 | 앱 셸의 콘텐츠 컨테이너(wrapper 모드) |
| 이유 | 마케팅/쇼케이스 페이지는 문서 스크롤이 SEO·접근성·브라우저 기본동작(뒤로가기 위치 등)과 가장 잘 맞음 | 사이드바/헤더 고정 + 본문만 스크롤 |

## 설치·기본 구성
```bash
bun add lenis gsap
```
```tsx
// 전역 CSS에 한 번
import 'lenis/dist/lenis.css';

// WebLayout.tsx
import { ReactLenis, type LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function WebLayout() {
  const lenisRef = useRef<LenisRef>(null);
  useEffect(() => {
    const update = (t: number) => lenisRef.current?.lenis?.raf(t * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);
  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1, smoothWheel: true }}>
      <ScrollSync /> {/* lenis.on('scroll', ScrollTrigger.update) + 라우트 리셋 */}
      <Header /><Outlet /><Footer />
    </ReactLenis>
  );
}
```
- `autoRaf: false` + gsap ticker 하나로 구동해 RAF 루프를 하나로 통일한다(두 루프가 돌면 떨림).
- `useLenis(ScrollTrigger.update)`로 스크롤 동기화.
- 관리자: `<ReactLenis className="h-full overflow-y-auto" options={{ autoRaf:false }}>`로 콘텐츠 영역을 감싼다(root 아님). `html/body`는 관리자 라우트에서만 `overflow:hidden` + 셸 `h-dvh`. 셸 grid/flex 자식에 `min-h-0` 필수. ScrollTrigger는 `scroller: 콘텐츠요소`를 지정한다.

## 충돌 규칙
1. **라우트 전환**: `useLocation().pathname` 변경 시 `lenis.scrollTo(0, { immediate: true })`. 해시가 있으면 해당 요소로 `scrollTo('#id', { offset: -헤더높이 })`. 브라우저 기본 `scrollRestoration`과 싸우지 않도록 `history.scrollRestoration = 'manual'`로 두고, 뒤로가기 위치 복원이 필요하면 경로별 위치를 저장해 직접 복원한다.
2. **모달/Sheet/Drawer(shadcn Dialog 계열)**: 열릴 때 `lenis.stop()`, 닫힐 때 `lenis.start()` — `open` 상태에 연결한 공용 훅(`useLockLenis(open)`) 하나로만 처리해 짝이 어긋나지 않게 한다. 모달 내부 스크롤 영역엔 `data-lenis-prevent`.
3. **내부 스크롤 요소**(Select 목록, Command 팔레트, 테이블 가로 스크롤, 코드 미리보기, 데모 iframe 래퍼): `data-lenis-prevent`(또는 `-wheel`/`-touch`). Radix Portal 콘텐츠는 body에 렌더되므로 콘텐츠 요소에 직접 속성을 붙인다.
4. **콘텐츠 높이 변화**(무한스크롤, 아코디언, 이미지 로드): Lenis는 ResizeObserver로 대부분 자동 반영되지만, 반영이 늦으면 `lenis.resize()` 후 `ScrollTrigger.refresh()`.
5. **앵커 링크**: `<a href="#x">`는 Lenis `anchors: true` 옵션 또는 `lenis.scrollTo`로 처리(네이티브 점프 금지).
6. **모바일**: `syncTouch`는 기본 false(네이티브 관성 유지). `prefers-reduced-motion`이면 `lerp: 1`(즉시)로.
7. **position: sticky/fixed**: Lenis는 네이티브 스크롤 위치를 바꾸므로 sticky는 정상 동작한다 — sticky가 깨지면 조상 요소의 `overflow`/`transform`을 먼저 의심한다.

## 스크롤 모션 가이드
- ScrollTrigger 애니메이션은 `transform`/`opacity`만. `filter: blur`, `clip-path`, 큰 요소 `scale`은 스크롤 중 재래스터화로 버벅임을 유발한다.
- `gsap.context()`로 감싸 언마운트 시 `ctx.revert()`.

## 검증 체크리스트 (QA 공용)
- [ ] 페이지당 Lenis 인스턴스 1개 (`document.querySelectorAll('.lenis').length` 또는 인스턴스 로깅)
- [ ] RAF 루프 1개(autoRaf false + gsap ticker)
- [ ] 라우트 이동 시 최상단으로, 해시 링크는 헤더 오프셋 반영
- [ ] 모달 열림 중 배경 휠 스크롤 안 됨, 모달 내부는 스크롤 됨, 닫은 뒤 스크롤 재개
- [ ] Select/Command/가로 테이블 위에서 휠 시 해당 요소만 스크롤
- [ ] 관리자: 사이드바 위 휠이 본문으로 새지 않음, body 스크롤바 없음
- [ ] reduced-motion에서 즉시 스크롤
- [ ] 실측: Playwright `page.mouse.wheel`을 여러 스텝(수십 ms 간격)으로 나눠 확인, longtask(50ms+) 관찰
