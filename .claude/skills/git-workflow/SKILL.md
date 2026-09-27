---
name: git-workflow
description: "다잇누몰 저장소의 git/GitHub(계정 jeongsh90) 운영 스킬 — 로컬 저장소 초기화, .gitignore, GitHub 원격 저장소 생성·연결(gh CLI), 커밋 단위와 메시지 규칙, 브랜치 전략, push 전 비밀값 점검. '깃 연결', '커밋', '푸시', 'github 올려', '저장소 만들어', '브랜치' 요청 시 및 페이지 그룹/단계 완료 시 사용."
---

# Git Workflow (jeongsh90)

## 현재 환경
- `gh` CLI가 `jeongsh90` 계정으로 로그인돼 있음(HTTPS). 전역 git user.name=`jeongsh90`.
- 작업 폴더: `d:\MyCloud\다잇누몰` — 상위 `D:\MyCloud`는 별개 프로젝트이므로 이 폴더를 독립 저장소로 둔다.

## 초기화
```bash
git init -b main
# .gitignore: node_modules, dist, .env*, !.env.example, *.local, _workspace_*/ (보관본), storage/, *.db, .DS_Store, test-results, playwright-report
git add -A && git commit -m "chore: 초기 구성"
```
`_workspace/`(현재 단계 산출물)는 기획·QA 기록이라 커밋한다. 보관본(`_workspace_YYYYMMDD…`)은 제외.

## 원격 연결 — 사용자 확인 후 실행
저장소 생성은 외부에 공개되는 작업이라 **이름·공개여부를 사용자에게 확인**한 뒤 실행한다(기본안: private).
```bash
gh repo create jeongsh90/{repo-name} --private --source=. --remote=origin --push
```
이미 원격이 있으면 `git remote -v`로 확인 후 `git remote add origin https://github.com/jeongsh90/{repo}.git`.

## 커밋 규칙
- 단위: 페이지 그룹 1개(구현+QA 통과) = 1커밋 이상. 스캐폴드·토큰·계약 변경은 별도 커밋.
- 메시지: `type(scope): 한국어 요약` — type: feat/fix/style/refactor/chore/docs, scope: web/admin/server/design/harness
  - 예: `feat(web): 스킨 상세 라이선스 선택과 라이브 데모 토글`
- 본문 끝에 시스템이 지정한 Co-Authored-By 트레일러를 붙인다.
- 커밋 전: `git diff --cached --stat` 확인, 비밀값 검색(`grep -rE "(sk_|secret|password=)"`), 대용량 파일(>5MB) 확인.

## 브랜치
- 1단계 `main`에 직접 커밋(1인 작업) — 단계 전환 시 태그: `v0.1-web`, `v0.2-admin`, `v1.0-server`.
- 큰 실험(디자인 전면 교체 등)만 `feat/*` 브랜치 후 병합.

## push
- 단계 완료 또는 사용자가 요청할 때. force push는 사용자 명시 요청 없이는 하지 않는다.
