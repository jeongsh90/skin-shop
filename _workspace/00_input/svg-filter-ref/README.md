# 스크롤 이미지 SVG 필터 레퍼런스 (사용자 지정, 2026-09-27)
요구: "스크롤시 이미지 svg필터 효과도 https://github.com/jeongsh90/figma"

출처: github.com/jeongsh90/figma — src/components/site/ParticleReveal.{tsx,css} (이 폴더에 원본 복사), 사용처 Approach.tsx(섹션 항목 이미지)
동작("잉크 번짐 리빌"):
- 아래층: 같은 이미지를 grayscale(1)로
- 위층: 원색 이미지를 SVG mask로 클리핑. mask 모양은 위에서 아래로 내려오는 곡선(Q 베지어, 진행도에 따라 bulge 증가) 블롭
- 블롭 가장자리를 feTurbulence(fractalNoise, baseFrequency 0.03 0.05, numOctaves 3, seed 7) + feDisplacementMap(scale 70)으로 거칠게 → 유기적 잉크 번짐
- 진행도 = 요소가 뷰포트에 들어와 지나가는 비율, `useLenis` 콜백에서 매 스크롤 프레임 path d 갱신

리더 메모(디자이너·프론트 확인 사항):
- 사용자 웹에만 적용(관리자 제외 — 노이즈와 같은 범위로 해석).
- 원본 파일에 주석이 있다 → 이식 시 우리 규칙(code-annotation)대로 주석 제거하고 ParticleReveal.md로 옮긴다.
- 성능: feDisplacementMap 필터가 걸린 mask를 매 프레임 갱신 → 화면에 동시에 여러 개면 버벅임 위험. 적용 대상을 "대표 비주얼 이미지"로 한정할지(예: 메인 섹션 비주얼, About Us 섹션 이미지, 템플릿 상세 대표 이미지), 템플릿 목록 카드 전체에 걸지는 디자이너가 결정하고 QA가 longtask로 실측.
- 뷰포트 밖 요소는 계산 건너뛰기(IntersectionObserver), prefers-reduced-motion이면 원색 이미지 그대로.
- id 충돌 방지(useId) 유지, 이미지 비율은 원본처럼 preserveAspectRatio="none"이면 찌그러질 수 있으니 컨테이너 비율 고정 필요.
