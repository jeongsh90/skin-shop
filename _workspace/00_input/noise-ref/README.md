# 노이즈 레퍼런스 (사용자 지정, 2026-09-27)
요구: "전체페이지(관리자페이지 제외) 노이즈 적용한다 https://github.com/jeongsh90/figma 참고"

출처: github.com/jeongsh90/figma (사용자 본인 저장소, public)
- 에셋: public/noise.png (200×200 PNG, 반복 타일) → 이 폴더 noise.png로 복사
- 적용 방식(src/App.tsx + src/App.css): 라우트 바깥, 앱 루트 맨 끝에 `<div className="noise">` 1개

```css
.noise {
  position: fixed; inset: 0;
  width: 100%; height: 100vh; height: 100svh; height: 100dvh;
  z-index: var(--int32-max);
  opacity: 0.2;
  background-image: url(/noise.png);
  background-repeat: repeat;
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

리더 메모(디자이너·프론트 확인 사항):
- 사용자 웹 레이아웃(WebLayout)에만 1개 두고, 관리자 레이아웃에는 두지 않는다.
- position: fixed 오버레이라 Lenis 스크롤과 무관(스크롤 시 따라 움직이지 않음). pointer-events: none 유지.
- multiply는 어두운 배경에서 거의 안 보인다 → 다크모드용 블렌드/투명도(예: screen/overlay, opacity 조정)를 디자이너가 결정해 토큰화.
- 최상위 z-index라 모달·토스트 위에도 깔린다(레퍼런스 동작 동일). 모달 위 노이즈를 원치 않으면 디자이너가 판단.
- 템플릿 데모 iframe 미리보기 위에도 덮이는지 여부는 디자이너가 결정(템플릿 원래 색 보존 원칙과 충돌 가능).
