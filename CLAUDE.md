# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 정체성

PM(대표님)이 자연어 시나리오만 작성하고, Claude 가 Playwright MCP 로 실제 브라우저를 조작해 블랙박스 QA 를 수행하는 워크스페이스입니다. 코드 빌드·유닛테스트는 없습니다. **산출물은 마크다운 시나리오·리포트와 시각 대시보드(HTML+data.js)** 가 전부입니다.

자세한 의도·로드맵은 `PLAN.md`, 사용 흐름은 `README.md` 참조.

## 실행 아키텍처 — 메인 Claude × `/qa-run` Skill

핵심은 **시나리오 단위 격리 실행**입니다. 흐름은 단방향:

```
대표님 요청  →  메인 Claude (오케스트레이터)
                  │  RUN-ID 생성, reports/{RUN-ID}/ 초기화
                  │  시나리오마다 ↓ 호출
                  ▼
              /qa-run Skill (context: fork, sonnet)   ← 격리, 순차 dispatch
                  │  Playwright MCP 로 브라우저 조작
                  │  TC 끝날 때마다 progress.jsonl 즉시 append
                  │  시나리오 종료 시:
                  │    ├ result.md 작성
                  │    ├ data.js 풀 빌드 + 덮어쓰기 (대시보드 즉시 반영)
                  │    └ scenarios/{시나리오}.md 의 "최근 실행 결과" 표 갱신
                  ▼  요약만 반환 (스크린샷·DOM 본문 절대 X)
              메인 Claude (마무리)
                  │  HISTORY.md append, STATUS.md 덮어쓰기
                  │  data.js 의 issues / history / total_runs 영역만 보강
```

- Skill 정의: `.claude/skills/qa-run/SKILL.md` — 시나리오 1개 실행의 모든 절차·규칙이 여기에 있음. 시나리오 실행 로직을 수정할 때는 이 파일이 단일 출처.
- 메인 Claude 의 책임은 **dispatch + 집계**뿐. 실제 브라우저 조작·검증은 절대 메인에서 하지 말 것 (컨텍스트 보호).
- 격리 단위는 시나리오. 사전조건 공유 이득이 격리 손실보다 크면 재평가.

> 🚨 **격리 트립와이어 — 메인은 `mcp__playwright__*` 를 단 한 번도 직접 호출하지 않는다.**
> 시나리오를 실행하려면 **반드시 `Skill` 도구로 `qa-run` 을 invoke** 한다 (frontmatter `context: fork` 가 격리 컨텍스트를 띄움). `browser_navigate`/`browser_snapshot`/`browser_take_screenshot` 등은 **fork 안에서만** 돈다.
> - **자가점검**: 메인 턴에서 `mcp__playwright__*` 를 부르려는 손이 나가면 **그 자체가 dispatch 누락 신호**다. 멈추고 `Skill(qa-run, …)` 으로 위임하라. 메인이 스냅샷·스크린샷을 받기 시작하면 컨텍스트가 회차당 수십만 토큰으로 폭발한다(실측: 47 TC 인라인 → 메인 79% 점유).
> - **증상**: 메인 `/context` 의 Messages 가 수십만 토큰이면 격리가 깨진 것. 정상이면 메인엔 300단어 요약만 누적돼 47 TC 풀실행에도 한 자릿수 % 에 머문다.
> - 시나리오 6개면 `Skill` invoke 도 6번. 한 번의 invoke 가 한 시나리오의 모든 TC·캡처를 fork 안에서 끝내고 요약만 돌려준다.

## RUN-ID 규칙

`RUN-YYYYMMDD-HHMM-{환경}` — 예: `RUN-20260502-1430-dev`. 메인이 생성해 모든 하위 산출물에서 동일하게 사용. **대표님이 RUN-ID 를 직접 지정해 주면 새로 만들지 않고 그 값을 그대로 쓴다** (병렬 모드에서 세션 간 RUN-ID 를 맞추기 위함 — 아래 "병렬 실행 모드" 참조).

## 병렬 실행 모드 — 세션 분리

한 Claude Code 세션은 Playwright MCP 서버가 하나 = 브라우저가 하나다. 따라서 **한 세션 안에서 시나리오를 동시에 돌리는 것은 불가** (fork 여러 개가 같은 탭을 놓고 충돌). 병렬이 필요하면 **터미널을 나눠 세션을 여러 개 띄운다.** `.mcp.json` 의 `--isolated` 옵션 덕에 세션마다 빈 프로필의 브라우저가 따로 뜬다 (프로필 잠금 충돌·쿠키 공유 없음).

**성립 조건** (하나라도 어긋나면 순차로 돌린다):
- 세션마다 **서로 다른 시나리오**, **서로 다른 테스트 계정** (예: 비교 테스트 03/04/05 = 사용자1/2/3)
- 같은 환경(env) 끼리만 병렬. **dev 와 prd 를 동시에 돌리지 않는다** (백엔드 부하로 `wait_ms` 비교 조건이 깨짐)
- 동시 세션 **최대 3개**

**절차**:
1. 대표님이 RUN-ID 를 하나 정한다 (예: `RUN-20260907-1600-dev`).
2. 터미널 N개에서 각각 Claude Code 를 띄우고, 세션마다 **시나리오 1개 + 환경 + 같은 RUN-ID** 를 주어 `/qa-run` 을 1회 dispatch 한다. 이 세션들은 **워커**다 — `reports/{RUN-ID}/` 가 이미 있으면 초기화하지 않고 그대로 쓰며, HISTORY/STATUS/버전 동결 등 **RUN 마무리를 하지 않는다.** Skill 의 300단어 요약만 받고 끝낸다.
3. 모든 워커가 끝난 뒤, **세션 하나에서만** "RUN-ID 마무리" 를 요청한다. 마무리 세션은 ① `progress.jsonl` 에 대상 시나리오가 모두 들어 있는지 확인 → ② `data.js` 를 풀 재빌드 (워커들의 마지막 쓰기 race 흡수) → ③ 평소대로 issues/history/total_runs 보강, HISTORY append, STATUS 덮어쓰기, 버전 동결을 1회 수행한다.
4. 다른 환경(prd)은 위 1~3 을 따로 반복한다.

공유 자원별 안전성: `progress.jsonl` 은 셸 `>>` 한 줄 append 만 허용(Skill 규칙), 스크린샷은 파일명에 TC 번호가 있어 충돌 없음, `scenarios/*.md` 결과 표는 시나리오별 자기 파일만 수정, `data.js` 는 마무리 세션이 재빌드.

## 폴더 책임 분리

| 폴더 | 추적 | 역할 |
|---|---|---|
| `specs/` | O | 기획서·정책서 원본 (PDF/DOCX/MD). 시나리오 작성의 입력. |
| `scenarios/` | O | 자연어 테스트 시나리오. **핵심 자산.** `_template.md` 골격 사용. |
| `environments/_template.md` | O | 환경 양식만 추적 |
| `environments/{dev,stage,prd}.md` | **X (gitignored)** | 민감정보 (URL·계정·테스트카드). 절대 커밋·요약·로그에 노출 금지. |
| `templates/` | O | **빈 양식 source of truth.** `dashboard.html` · `dashboard.css` · `data.js` · `STATUS.md` · `HISTORY.md`. |
| `reports/` | O | 실행 산출물 (RUN 폴더·스크린샷·대시보드·STATUS/HISTORY). 추적해 이력 보존. 첫 실행 시 메인 Claude 가 `templates/` → `reports/` 로 복사. |
| `_sample/` | O | 시나리오·리포트 예시 (가상 데이터). 양식 미리보기용. |

## 3계층 이력 관리 — 갱신 주체와 시점

| 파일 | 갱신 시점 | 누가 |
|---|---|---|
| `reports/{RUN-ID}/progress.jsonl` | TC 끝날 때마다 1줄 append | `/qa-run` Skill (즉시) |
| `reports/{RUN-ID}/{시나리오}_result.md` | 시나리오 종료 시 | `/qa-run` Skill |
| `reports/data.js` (`scenarios` / `kpis` / `meta`) | **시나리오 종료 시마다 풀 빌드 + 덮어쓰기** | **`/qa-run` Skill** |
| `reports/data.js` (`issues` / `history` / `total_runs` / `runs_by_env`) | RUN 전체 종료 시 보강 | 메인 Claude |
| `reports/versions/v{N}.js` + `reports/versions.js` | **RUN 전체 종료 시 1회** (버전 동결) | 메인 Claude |
| `reports/STATUS.md` | 매 실행 후 덮어쓰기 | 메인 Claude |
| `reports/HISTORY.md` | 매 실행 후 한 줄 append | 메인 Claude |
| `scenarios/{시나리오}.md` 하단 "최근 실행 결과" 표 | **시나리오 종료 시** (자기 시나리오만, 최신 5행 유지) | **`/qa-run` Skill** |
| `reports/dashboard.html` | 거의 변경 X (구조 개편 시만) | 사람 |

## 시각화 정책

- 단일 HTML 대시보드 + `dashboard.css` + `data.js` 분리 구조. **`dashboard.html` 은 구조·렌더링 JS 만, 스타일은 전부 `dashboard.css`, 데이터는 전부 `data.js`** (`window.QA_DATA`).
- 매 실행 후 메인이 갱신하는 것은 **`reports/data.js` 한 파일뿐**. 스키마 주체는 `templates/dashboard.html` 의 렌더링 JS.
- 마크다운에는 mermaid 등 차트 임베드 금지. 시각화는 대시보드에서만.
- **"전체 시나리오 / TC" 영역은 카탈로그 + 오버레이**. `data.js` 의 `scenarios` 배열은 최근 회차 실행분이 아니라 `scenarios/*.md` 의 **전체 시나리오·TC 카탈로그**여야 한다. 메인 Claude 는 매 실행 후 `data.js` 작성 시 `scenarios/` 폴더를 스캔해 카탈로그를 빌드(파일명 오름차순)하고, 이번 회차 결과를 각 TC 의 `status`(`PASS`/`FAIL`/`—`)에 오버레이한다. 이번 회차에 실행되지 않은 TC 는 `status: "—"`.

## 버전 관리 — 회차별 스냅샷

`data.js` 는 항상 **최신 라이브** (Skill 이 시나리오마다 덮어씀). 과거 회차를 다시 보려면 **RUN 종료 시 그 시점 `data.js` 를 동결**해 둔다.

- **버전 1개 = 완료된 RUN 1개.** Skill 동작은 그대로 (시나리오마다 `data.js` 풀빌드 덮어쓰기). 버전 봉인은 RUN 수명주기를 소유한 **메인 Claude** 가 RUN 끝에 1회만 수행.
- 파일: `reports/versions/v{N}.js` (= 그 시점 `data.js` 복사, `window.QA_DATA`, 불변) + `reports/versions.js` (매니페스트, `window.QA_VERSIONS`).
- **메인 Claude 의 RUN 종료 절차**: ① `versions.js` 읽어 `vN = 최대번호+1` 할당 → ② 최종 `reports/data.js` 를 `reports/versions/v{N}.js` 로 복사 → ③ `versions.js` 의 `list` 맨 앞에 `{ v, run_id, env, date, file }` 추가하고 `current` 를 `vN` 으로 갱신. **6개 시나리오 모두 끝난 뒤 1번** (일부만 돌린 RUN 이면 그 버전엔 안 돌린 TC 가 `—` 로 남음).
- 라벨 형식: `v{N} · {YYYY-MM-DD} · {env}` (예: `v2 · 2026-06-03 · dev`).
- `dashboard.html` 은 `versions.js` 를 읽어 버전 선택기를 그리고, 선택 시 `?v=vN` 새로고침으로 해당 스냅샷을 로드한다. 매니페스트가 없으면 선택기 숨김 + `data.js` 만 로드 (하위호환).

## Playwright MCP

`.mcp.json` 에 `playwright` 서버 등록 (`@playwright/mcp@latest --isolated`). `--isolated` 는 브라우저 프로필을 메모리에만 두는 옵션 — 세션마다 빈 프로필로 뜨므로 병렬 세션 간 프로필 잠금·로그인 쿠키 충돌이 없고, 시나리오마다 지정 계정으로 새로 로그인하는 현행 절차와도 맞는다. `.claude/settings.local.json` 에서 활성화 상태. `/qa-run` Skill 안에서만 사용:
- `browser_navigate` / `browser_click` / `browser_type` / `browser_press_key` — 인터랙션
- `browser_snapshot` — 접근성 트리 기반 검증
- `browser_take_screenshot` — `reports/{RUN-ID}/screenshots/` 에 PNG 저장. 파일명: `{scenario-slug}-{tc-id}-{step}-{설명}.png`. **프롬프트 있는 TC 는 기본 2장**: `02-prompt`(프롬프트 입력 직후·전송 전, 전체 뷰포트라 편집 전 본문=기준선 겸함) → `03-after`(완료 후). `01-before` 는 **(a) 프롬프트 없는 TC(저장/영속)** 또는 **(b) `02-prompt` 를 패널만 크롭한 경우**에만 찍는다. 결과가 1화면을 넘으면 `03b-after`·`03c-after`… 로 다장 캡처. 상세 규칙은 `/qa-run` SKILL.md.
- `browser_console_messages` — 콘솔 에러 확인

## 즉시 기록 — `progress.jsonl`

TC 1개 끝날 때마다 즉시 1줄 append (다음 TC 진행 전). 중간 중단되어도 직전까지 결과 보존이 목적이므로 **건너뛰기 절대 금지**.

```json
{"ts":"2026-05-02T14:30:42","run_id":"RUN-20260502-1430-dev","scenario":"01-회원가입","tc":"TC-01","result":"PASS","wait_ms":3214,"in_tokens":1280,"out_tokens":3450,"screenshot":["screenshots/signup-tc01-01-before.png"],"note":""}
```

`result`: `PASS` / `FAIL` / `SKIP` / `BLOCKED`(선행 TC 의존 실패). `wait_ms`: AI 작업 시간(프롬프트 전송→편집 완료) 실측, `browser_evaluate(Date.now())` 두 번 차이. 없으면 `null`. `in_tokens`/`out_tokens`: 응답 완료 후 사이드패널 하단에서 읽은 입력·출력 토큰(정수). 없으면 `null`.

## 메인 ↔ Skill 반환 경계

`/qa-run` 가 메인에 반환하는 요약은 **300단어 이내**, 다음만 포함: 시나리오명·RUN-ID·환경·결과 카운트·소요시간·result.md 경로·신규 실패·연속 실패·권장 액션. **스크린샷 본문, DOM 덤프, 콘솔 로그 전체, 비밀번호·토큰 절대 포함 금지** (디스크에만).

## 타임아웃·실패 처리

- TC 1개 최대 60초, 시나리오 전체 최대 5분. 초과 시 `FAIL` + `note: "timeout"`.
- TC 가 실패해도 시나리오 끝까지 계속 진행 (조기 abort 금지). 후속 TC 가 실패한 TC 결과에 의존하면 `BLOCKED`.
- 시나리오 종료 시 페이지·컨텍스트 닫음.

## 환경별 안전장치

- **`prd` 환경 + 데이터 변경 시나리오**: 실행 전 메인 Claude 가 대표님께 명시적 재확인 요청.
- 시나리오는 환경 독립적으로 작성, URL·계정은 `environments/{env}.md` 에서 주입.
- dev 안정화 → stage → prd 순으로 확장.

## 작업 원칙

- **계획 → 실행** 순서. 시나리오 실행 요청을 받으면 RUN-ID·대상 시나리오·환경을 먼저 메인에서 확정한 뒤 Skill dispatch.
- 시나리오 실행 자체가 아닌 **인프라 변경** (Skill 절차, 템플릿, 폴더 구조) 은 코드 작업이므로 "계획 수립 → 동의 → 실행" 흐름을 지킬 것.

## 작업 방식 — 워크트리

@worktree.md
