---
name: skin-shop-orchestrator
description: "다잇누몰(홈페이지 스킨 판매 사이트) 구축 에이전트 팀(기획·디자인·프론트·백엔드·QA)을 조율하는 오케스트레이터. React+shadcn+Lenis 기반 사용자 웹페이지 → 관리자페이지 → 마지막 서버 연결 순서로 진행한다. '스킨 판매 사이트', '다잇누몰', '웹페이지 만들어', '메인/목록/상세/장바구니/결제/마이페이지', '관리자페이지', '어드민', '상품관리/주문관리/회원관리', '서버 연결', '배포', '디자인 입혀', '이 느낌으로', 'shadcn 레지스트리' 요청 시 사용. 후속 작업: 특정 페이지만 다시, 수정, 보완, 기능 추가, 재실행, 업데이트, QA 재검증, 이전 결과 개선, 다음 단계 진행 요청에도 반드시 이 스킬을 사용."
---

# Skin Shop Orchestrator (다잇누몰)

홈페이지 스킨 판매 사이트를 **1단계 사용자 웹페이지 → 2단계 관리자페이지 → 3단계 서버 연결** 순서로 구축한다. 단계 사이에는 반드시 사용자 확인을 받는다(사용자가 명시한 작업 순서이고, 앞 단계 결과를 보고 방향이 바뀔 수 있기 때문).

## 실행 모드: 하이브리드 (서브 에이전트 파이프라인 + 생성-검증)

이 환경에는 `TeamCreate`가 없으므로 `Agent` 도구로 서브 에이전트를 호출한다. 같은 에이전트에게 후속 지시를 줄 때는 새로 띄우지 말고 `SendMessage`로 이어간다(컨텍스트 유지). 독립 작업(기획 완료 후 디자인 ↔ 스캐폴드)은 한 메시지에서 병렬 호출한다. 모든 Agent 호출에 `model: "opus"`를 명시한다. `TeamCreate`가 사용 가능한 환경이라면 같은 구성으로 팀 모드를 써도 된다.

## 에이전트 구성

| 에이전트 | subagent_type | 역할 | 스킬 | 주 산출물 |
|---|---|---|---|---|
| skin-planner | skin-planner | IA·기능명세·데이터 요구 | skin-shop-ia, skin-data-contract | `01_planner_*.md` |
| skin-designer | skin-designer | 디자인 브리프·토큰·레지스트리 제안 | skin-design-system, impeccable | `02_designer_*.md` |
| skin-frontend-dev | skin-frontend-dev | React 구현·Lenis·mock 계층 | react-shadcn-setup, lenis-smooth-scroll, skin-data-contract, skin-design-system, git-workflow, code-annotation | `src/`, `03_frontend_progress.md` |
| skin-backend-dev | skin-backend-dev | 서버·DB·인증·결제·배포(3단계 전용) | skin-server-integration, skin-data-contract, git-workflow, code-annotation | `server/`, `04_backend_*.md` |
| skin-qa | skin-qa | 점진 교차검증·Playwright 실측 | skin-qa-checklist, lenis-smooth-scroll, code-annotation | `05_qa_report_*.md` |

## 전역 규칙 (사용자 지정)
- **작업 파일에는 주석을 달지 않는다.** 설명·의도·출처는 같은 폴더의 같은 이름 `.md`(예: `Header.tsx` → `Header.md`)에 적는다 — `code-annotation` 스킬. 코드를 쓰는 모든 에이전트 프롬프트에 이 규칙을 명시한다.

## 워크플로우

### Phase 0: 컨텍스트 확인
1. `_workspace/progress.md`를 읽는다(없으면 초기 실행). 이 파일은 단계별 상태(`web: 진행중/완료`, `admin: …`, `server: …`)와 마지막 QA 결과를 한 줄씩 기록하는 리더 전용 상태판이다.
2. 분기:
   - **초기 실행**: `_workspace/` 없음 → Phase 1
   - **부분 수정**("상세페이지만 다시", "헤더 디자인 바꿔"): 해당 에이전트만 `SendMessage`/재호출 → 수정 → 해당 범위 QA → 커밋
   - **다음 단계 진행**("관리자페이지 시작"): progress.md에서 이전 단계가 `완료`인지 확인. 아니면 남은 결함을 사용자에게 알리고 진행 여부를 묻는다
   - **새 입력**(디자인 레퍼런스 교체 등): 영향받는 단계의 `_workspace/{stage}/`를 `_workspace/{stage}_{YYYYMMDD_HHMMSS}/`로 보관 후 재생성
3. git 상태 확인(`git status`). 원격이 없으면 `git-workflow` 스킬의 원격 연결 절차를 사용자 확인 후 수행.

### Phase 1: 준비
1. 사용자 요구·레퍼런스를 `_workspace/00_input/`에 저장(이미지 경로, 링크, 원문 요구사항).
2. 레지스트리 사용 요청이 있으면 `00_input/registry-requests.md`에 그대로 적는다.

### 단계 A — 사용자 웹페이지 (`{stage}=web`)

**A1 기획** — skin-planner 호출. 산출: `_workspace/web/01_planner_{ia,spec,open-questions}.md` + `_workspace/api-contract.md` 초안(웹이 쓰는 엔티티).
→ open-questions 중 구현을 막는 항목만 사용자에게 묻는다(AskUserQuestion, 최대 4개). 나머지는 가정으로 진행.

**A2 병렬** — 한 메시지에서 동시 호출:
- skin-designer: 브리프·토큰·(필요시) 레지스트리 제안
- skin-frontend-dev: `react-shadcn-setup`으로 스캐폴드, `lenis-smooth-scroll`로 웹 레이아웃 Lenis, `skin-data-contract`로 타입·mock 어댑터 골격, git 초기 커밋

→ 레지스트리 제안이 있으면 **사용자 승인**을 받는다(후보·이유·설치 명령 제시). 사용자가 레지스트리를 직접 지정한 경우는 그 목록을 그대로 쓴다.

**A3 페이지 그룹 구현 + 점진 QA** — 아래 그룹 순서로 반복:
1. 공통 레이아웃(헤더/푸터/모바일 메뉴) + 메인
2. 스킨 목록(카테고리/필터/정렬/검색) + 스킨 상세(갤러리·라이브 데모·라이선스 선택)
3. 장바구니 + 주문/결제(mock) + 주문 완료
4. 로그인/회원가입 + 마이페이지(구매내역·다운로드·라이선스)
5. 고객센터(공지/FAQ/문의) + 약관/정책 + 404

각 그룹: frontend-dev 구현 → skin-qa 해당 범위 검증 → 결함은 담당자에게 `SendMessage`로 수정 요청 → 재검증 통과 → 커밋. 그룹 구성은 planner 명세에 맞춰 조정 가능.

**A4 단계 마감** — skin-qa 전체 회귀(라우트 전수, 반응형 4폭, Lenis 체크리스트) → progress.md `web: 완료` → 사용자에게 결과·스크린샷·남은 이슈 보고 후 **관리자 단계 착수 확인**.

### 단계 B — 관리자페이지 (`{stage}=admin`)
A와 동일 구조. 차이점:
- B1 planner는 웹 단계의 api-contract를 **확장**한다(관리자 전용 필드·엔티티 추가, 기존 필드 변경 시 웹 사용처 영향 목록 첨부).
- 디자인은 웹과 토큰을 공유하되 관리자 톤(고밀도·저채도) 오버라이드.
- 관리자 레이아웃은 앱 셸(사이드바+헤더+콘텐츠) — `lenis-smooth-scroll`의 "관리자 셸" 규칙 적용.
- 페이지 그룹 예: ① 로그인·셸·대시보드 ② 스킨(상품)·카테고리 관리(등록/수정: 이미지·데모URL·파일·가격·라이선스) ③ 주문·결제·환불 ④ 회원 ⑤ 리뷰·문의·공지·배너·쿠폰 ⑥ 설정
- 웹↔관리자 연동을 mock에서도 확인: 관리자에서 등록한 스킨이 웹 목록에 뜨는지(같은 mock 저장소 공유).

### 단계 C — 서버 연결 (`{stage}=server`)
1. skin-backend-dev가 `skin-server-integration`의 기본안(스택·DB·호스팅·결제)을 제시 → **사용자 결정** 대기.
2. 엔드포인트를 리소스 단위로 구현 → 각 단위마다 skin-qa 교차검증(계약 ↔ 응답 ↔ 어댑터 ↔ 화면).
3. 어댑터 교체(`VITE_API_MODE=http`), mock 모드는 개발용으로 유지.
4. 배포·도메인 연결(사용자 계정/비용이 걸리는 작업은 매번 확인).

### Phase 종료 (각 단계 공통)
- progress.md 갱신, 커밋(`git-workflow`), 원격 push는 사용자 확인 후.
- 사용자에게 피드백 요청: "결과에서 개선할 부분, 워크플로우에서 바꾸고 싶은 점이 있나요?" — 피드백은 해당 스킬/에이전트에 일반화해 반영하고 CLAUDE.md 변경 이력에 기록.

## 데이터 흐름

```
00_input ─▶ planner ─▶ {stage}/01_planner_* ─┬─▶ designer ─▶ 02_designer_*  ─┐
                    └▶ api-contract.md ──────┼─▶ frontend  ─▶ src/ + 03_progress ─▶ qa ─▶ 05_qa_report
                                             │                        ▲                 │
                                             └────────── 수정 요청 ◀─┴─────────────────┘
(단계 C) api-contract.md ─▶ backend ─▶ server/ + http-adapter ─▶ qa(교차검증)
```

## 에러 핸들링

| 상황 | 전략 |
|---|---|
| 에이전트 실패/중단 | 1회 재시도(`SendMessage`로 상태 확인 후 재지시). 재실패 시 리더가 범위를 줄여 재할당, 보고서에 누락 명시 |
| 같은 결함 2회 재발 | patch 중단 → 원인·접근방식 재검토 후 다른 방법으로(상위 `D:\MyCloud\.claude\RULES.md` 1항) |
| 명세↔디자인 충돌 | 삭제하지 않고 두 안을 병기해 사용자에게 선택 요청 |
| 레지스트리 설치 실패/덮어쓰기 프롬프트 | 커스텀 파일 덮어쓰기는 거부, 실패 시 공식 shadcn 조합 대안 제시 |
| 외부 계정/비용 필요(GitHub 원격 생성, 호스팅, 결제) | 실행 전 사용자 확인. 인증 토큰을 요구하거나 우회하지 않음 |

## 테스트 시나리오

### 정상 흐름
1. 사용자: "웹페이지부터 시작해" → Phase 0 초기 실행 → A1 기획 → open-questions 2개 확인
2. A2 디자인·스캐폴드 병렬, 초기 커밋
3. A3 그룹 1~5 반복, 각 그룹 QA 통과 후 커밋
4. A4 전체 회귀 통과 → progress `web: 완료` → 사용자에게 관리자 착수 확인

### 에러 흐름
1. 그룹 2 QA에서 "상세 모달 열린 상태에서 배경이 스크롤됨" 결함
2. frontend-dev 수정 → 재검증 실패(재발)
3. 리더가 patch 중단, lenis-smooth-scroll의 모달 규칙(stop/start vs data-lenis-prevent) 기준으로 원인 재검토 지시
4. 재구현 → 사람 속도 휠 스크롤로 재검증 통과 → 커밋, 리포트에 경위 기록
