## 하네스: 홈페이지 스킨 판매 사이트 (다잇누몰)

**목표:** React + shadcn/ui(+커뮤니티 레지스트리) + Lenis 스무스 스크롤로 스킨 판매 사용자 웹페이지 → 관리자페이지를 로컬(mock 데이터)로 완성한 뒤, 마지막에 서버를 연결·배포한다. 저장소는 GitHub `jeongsh90`.

**범위 주의:** 이 폴더는 상위 `D:\MyCloud`(파일 저장소 앱)와 별개 프로젝트다. 상위 CLAUDE.md의 `storage-app-orchestrator` 트리거·Andromeda 디자인 규칙은 이 폴더 작업에 적용하지 않는다. 단, 상위 `D:\MyCloud\.claude\RULES.md`의 작업 규칙(같은 버그 재발 시 patch 반복 금지·아키텍처 재검토, 자동화 테스트 통과 ≠ 실제 동작, 완료 보고 전 재검토, 한국어 응답)은 동일하게 따른다.

**트리거:** 스킨 판매 사이트의 기획/디자인/웹페이지/관리자페이지/Lenis 스크롤/shadcn·레지스트리/데이터·mock/서버 연결/배포/QA/git 관련 작업 요청 시 `skin-shop-orchestrator` 스킬을 사용하라. 후속 수정·특정 페이지 재작업·다음 단계 진행도 동일 스킬로 처리한다. 단순 질문은 직접 응답 가능.

**진행 순서:** 1단계 사용자 웹페이지 → 2단계 관리자페이지 → 3단계 서버 연결(맨 마지막). 단계 전환 전 사용자 확인 필수. 커뮤니티 레지스트리(https://ui.shadcn.com/docs/directory) 컴포넌트는 사용자 승인 후 설치.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-09-27 | 초기 구성 — 에이전트 5종(skin-planner/designer/frontend-dev/backend-dev/qa), 스킬 9종(skin-shop-orchestrator, skin-shop-ia, skin-data-contract, react-shadcn-setup, lenis-smooth-scroll, skin-design-system, skin-server-integration, skin-qa-checklist, git-workflow). 실행 모드는 서브 에이전트 파이프라인+생성-검증(환경에 TeamCreate 없음), 페이지 그룹마다 점진 QA | 전체 | 스킨 판매 사이트 구축 요청(웹→관리자→서버 순, shadcn+레지스트리, Lenis 전 페이지, jeongsh90 git) |
