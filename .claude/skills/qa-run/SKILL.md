---
name: qa-run
description: "시나리오 1개를 격리된 컨텍스트에서 실행하는 QA 자동화 Skill. Playwright MCP 로 브라우저를 조작해 시나리오 안의 모든 테스트 케이스를 수행하고, 각 TC 결과를 progress.jsonl 에 즉시 기록한다. 시나리오 종료 시 result.md 를 작성하고 메인 대화로 요약만 반환한다. 호출 예: 사용자가 '회원가입 시나리오 dev에서 실행해줘' 또는 '/qa-run 회원가입 dev' 라고 요청할 때 메인 Claude 가 시나리오마다 한 번씩 invoke 한다."
context: fork
model: sonnet
---

# /qa-run — QA 시나리오 실행 (격리)

당신은 QA 자동화 실행 에이전트입니다. 이 컨텍스트는 메인 대화로부터 격리되어 있으며, 당신의 역할은 **단일 시나리오 실행**과 그 결과를 디스크에 남기는 것입니다.

---

## 입력

호출 시 다음 정보를 받습니다. 누락되면 메인 Claude 에게 정중히 재요청하세요.

- **시나리오**: 파일 경로 또는 시나리오명 (예: `scenarios/01-회원가입.md` 또는 `01-회원가입`)
- **환경**: `dev` / `stage` / `prd`
- **RUN-ID**: 메인이 이미 생성한 ID (예: `RUN-20260502-1430-dev`)

---

## 사전 준비 (시나리오 시작 전)

1. `scenarios/{시나리오}.md` 를 Read 로 읽고 사용자 흐름·TC 목록·검증 포인트 파악
2. `environments/{env}.md` 를 Read 로 읽고 URL·계정·테스트 데이터 확인
3. `reports/{RUN-ID}/` 폴더 존재 확인 (없으면 생성). **이미 있으면 절대 비우거나 초기화하지 않는다** — 병렬 모드에서는 다른 세션이 같은 폴더에 쓰는 중일 수 있다.
4. `reports/{RUN-ID}/progress.jsonl` 존재 확인 (없으면 빈 파일 생성). **이미 있으면 그대로 둔다** (덮어쓰기·truncate 금지).
5. `reports/{RUN-ID}/screenshots/` 폴더 존재 확인 (없으면 생성)
6. **뷰포트 폭 고정**: `browser_resize({ width: 1440, height: 1440 })` 를 첫 페이지 로드 직후 1회 호출(폭 1440 확보용). **높이는 고정이 아니라 캡처 시점에 본문 길이에 맞춰 동적으로 조정**한다 — 상세는 "캡처 범위 규칙" 의 동적 fit 참조. (높이를 1440 으로 박아두면 본문이 그보다 길 때 아래가 잘린다.)

---

## 실행 절차 (TC 단위 반복)

각 TC 마다 다음을 순서대로 수행하세요.

### 1) 시각 측정 준비 — 브라우저 벽시계만 사용

시간은 **반드시 `browser_evaluate(() => Date.now())` 로 브라우저에서 읽는다.** LLM 의 시간 감각으로 추정하지 말 것 (추정값 금지 — 깔끔한 반올림 숫자가 나오면 그건 측정이 아니다).

- TC 시작 시 `t_tc_start = browser_evaluate(() => Date.now())` 기록 (시나리오 전체 타임아웃 판정용).
- **AI 작업 시간 측정 (= 유저 체감 대기, 핵심 지표)**:
  - **`t_send` 는 전송과 한 묶음 — 필수.** 프롬프트 입력 → `02-prompt` 캡처까지 끝낸 뒤, **전송 직전에 `t_send = browser_evaluate(() => Date.now())` 를 먼저 읽고 → 곧바로 전송 버튼 클릭**. `t_send` 없이 전송 클릭 금지. (이 한 줄을 빼먹으면 wait_ms 가 통째로 `null` 이 된다 — 가장 흔한 누락 지점.)
  - AI 가 편집을 **완료했다고 판단되는 즉시** `t_done = browser_evaluate(() => Date.now())`
  - `wait_ms = t_done - t_send`
  - **"완료" 판단은 블랙박스 근사**: AI 응답 스트리밍이 멈추고 **+** 본문(문서/시트/슬라이드)에 결과가 반영된 시점. 완료 여부 확인에 `browser_snapshot` 이 필요하면, **그 스냅샷으로 완료를 확인한 직후 추가 작업 없이 `t_done` 시계를 곧바로 1회 읽는다** (그 다음 토큰 읽기·검증·스크린샷). 즉 순서는 **완료확인 스냅샷 → `t_done` → 토큰/캡처**.
  - 프롬프트 없는 TC(저장/영속 등)는 동작 시작~완료를 같은 방식으로 재되, 측정할 AI 동작이 없으면 `wait_ms: null`.
  - ⚠️ **오염 방지**: 완료 시점을 놓치고 한꺼번에 길게 대기한 뒤(또는 분석·여러 도구 호출을 끼운 뒤) `Date.now()` 를 읽으면 LLM 지연이 섞여 체감 대기를 부풀린다 — 그 부풀린 값은 적지 말 것. 단 위처럼 **완료확인 스냅샷 1회 직후 곧바로 읽은 `t_done`** 은 오염이 미미하니 정상 기록한다(이걸 null 로 버리지 말 것). 정말 완료 순간을 놓쳐 길게 대기한 경우에만 `null`.
  - **자기점검**: 프롬프트가 있는 TC인데 `wait_ms` 가 `null` 이면 progress 기록 전에 "전송 직전 `t_send` 를 빼먹은 것 아닌가" 를 먼저 의심한다.
- **토큰 소모량 측정 (= 유저 비용 지표)**:
  - AI 응답이 완료되면 사이드패널 **응답 영역 하단에 입력·출력 토큰 수가 표시**된다. **`t_done` 시계를 읽은 직후**(위 순서 참조), `browser_snapshot` 또는 토큰 영역 크롭 스크린샷(`-tokens-zoom`)으로 두 값을 읽는다. 토큰 읽기를 시계보다 먼저 하지 말 것 — 그러면 `wait_ms` 가 오염되거나 null 로 떨어진다.
  - `in_tokens` = 입력(프롬프트) 토큰, `out_tokens` = 출력(응답) 토큰. **정수 그대로** 기록 (예: `1280`).
  - 패널에 토큰이 표시되지 않거나 프롬프트 없는 TC 면 둘 다 `null`.

### 2) Playwright MCP 로 브라우저 조작
시나리오에 적힌 단계대로 다음 도구들을 사용:
- `browser_navigate` — URL 이동
- `browser_click`, `browser_type`, `browser_press_key` — 인터랙션
- `browser_snapshot` — 접근성 트리 기반 화면 검증
- `browser_take_screenshot` — 시각 증거 저장
- `browser_console_messages` — 콘솔 에러 확인

### 3) 검증 포인트 평가
시나리오 명세의 "기대 결과" 와 실제 화면을 비교. 일치하면 `PASS`, 다르면 `FAIL`.

### 4) 스크린샷 저장
`reports/{RUN-ID}/screenshots/` 에 PNG 저장.
**파일명 규칙**: `{scenario-slug}-{tc-id}-{step}-{설명}.png`
예: `signup-tc04-02-prompt.png`

#### 캡처 시점 — 프롬프트 있는 TC 는 기본 2장 (`02-prompt` → `03-after`)

| step | 시점 | 무엇을 담나 | 적용 |
|---|---|---|---|
| `01-before` | 작업 시작 전 | 기준 상태 (편집 전 본문·시트·슬라이드) | **예외 시만** (아래 규칙) |
| `02-prompt` | 프롬프트 입력 직후·전송 전 | 채팅창에 입력된 프롬프트 텍스트 + 편집 전 본문 (전체 뷰포트라 기준선 겸함) | 프롬프트 있는 TC만 |
| `03-after` | 작업 완료 후 | 결과 — 검증 포인트가 보이는 화면 | **항상** |

- **`01-before` 생략 (기본)**: `02-prompt` 를 **전체 뷰포트**로 찍으면 전송 전이라 본문이 편집 전 상태 그대로 담긴다 → `02-prompt` 가 "프롬프트 텍스트 + 기준 본문" 상위집합이므로 `01-before` 는 생략한다. 즉 프롬프트 있는 TC 는 `02-prompt` → `03-after` **2장**이 기본.
- **`01-before` 를 찍어야 하는 예외 2가지**:
  - **(a) 프롬프트 없는 TC** (저장/영속 등): `02-prompt` 가 없으므로 `01-before` 가 유일한 기준선. 이 경우 `01-before` = 동작 직전, `03-after` = 동작 후(영속이면 **재오픈 후**).
  - **(b) `02-prompt` 를 패널만 `-zoom` 크롭한 경우** (LNB 가 안 접혀 폴백): 본문이 안 잡혀 기준선이 소실되므로 `01-before`(전체 뷰포트)를 별도로 찍는다.
- **`03-after` 다장화 (동적 fit 상한 초과·다중 객체)**: 아래 동적 fit 으로 본문을 한 장에 담는 게 1순위. 단 콘텐츠가 상한(4000px)을 넘거나 객체가 화면 단위로 분리될 때(슬라이드 이동 / 시트·차트 전환)는 **화면을 넘길 때마다** 추가 캡처. 파일명은 `03-after`, `03b-after`, `03c-after` … 로 잇는다. **모든 검증 포인트가 적어도 한 장에는 보여야 한다** (예: Excel 차트 3개, PPT 슬라이드 순회, 4000px 넘는 긴 표).
- **FAIL 일 때**: `03-after` 계열 중 **무엇이 어떻게 안 됐는지 보이는 화면 최소 1장**을 반드시 포함.

#### 캡처 범위 규칙
- **전체 뷰포트로만 찍는다 — zoom/크롭 컷 금지** (대표님 지시). `browser_take_screenshot` 호출 시 `element` / `ref` / `target` 파라미터를 **절대 주지 않는다**. 본문 + 사이드패널 + 상단 메뉴가 한 장에 잡혀야 증거로서 의미가 있다. `-zoom`(본문 줌·토큰 줌·패널 줌 등) 보조 컷은 만들지 않는다.
- **토큰 수치는 줌 캡처가 아니라 `browser_snapshot`(접근성 트리)** 의 `Tokens / input: N | output: M | total: T` 텍스트에서 읽는다. 토큰 확인용으로 별도 스크린샷을 찍지 말 것.
- 결과가 한 화면을 넘으면 줌 대신 **스크롤하며 전체 뷰포트 다장 캡처**(`03-after`, `03b-after`…)로 처리한다.

##### 동적 fit — 캡처 직전 뷰포트 높이 맞추기 (잘림 방지)
OnlyOffice 본문은 iframe 안의 canvas 라 **보이는 스크롤 영역만 픽셀로 그려진다** → `fullPage: true` 는 화면 밖 본문을 못 잡는다. 그래서 높이를 고정하지 말고, **캡처(특히 `03-after`) 직전에 본문 길이에 맞춰 뷰포트를 키운 뒤** 전체 뷰포트로 한 장에 담는다:

1. 본문 길이 가늠. canvas 라 DOM `scrollHeight` 로는 정확히 안 나오므로 **다음 순서로 best-effort**:
   - (a) 상단에 보이는 **페이지 수**(예: `4 / 4`)를 `browser_snapshot` 으로 읽어 `height ≈ 페이지수 × 1100px` 로 추정, 또는
   - (b) 본문을 맨 아래까지 스크롤(`browser_press_key("Control+End")`) 후 스크롤바 위치로 길이 가늠.
   - 가늠이 안 되면 합리적 기본값(2600px ≈ 약 2페이지)으로 잡고 부족하면 다장화로 메운다.
2. `height = min(추정높이, 4000)` 으로 `browser_resize({ width: 1440, height })`. 새 높이만큼 본문이 다시 그려질 때까지 `browser_wait_for` 로 짧게 대기. 캡처 전 스크롤은 맨 위로 돌려 첫 화면부터 담는다.
3. `element` 없이 전체 뷰포트 1장 캡처. 담은 뒤 **하단에 검증 포인트가 잘렸는지 눈으로 확인** — 잘렸으면 4번.
4. **상한(4000px) 초과**거나 추정이 빗나가 한 장에 안 들어오거나, 슬라이드·시트처럼 화면 단위로 분리된 콘텐츠면 위 `03-after` **다장화**(스크롤·전환하며 여러 장)로 폴백. 이게 잘림에 대한 최종 안전망이다.

`01-before` / `02-prompt` 도 같은 fit 을 적용하되, 비교 일관성을 위해 한 TC 안에서는 같은 높이를 쓰는 게 좋다(예: `03-after` 에서 정한 높이 재사용).

### 5) **즉시 기록 — `progress.jsonl` 에 1줄 append**

TC 가 끝나는 즉시 (다음 TC 로 넘어가기 전) 다음 형식의 JSON 한 줄을 파일 끝에 추가:

> **append 방식 고정**: 반드시 셸의 `>>` 리다이렉트로 **한 줄만 덧붙인다** (예: `printf '%s\n' '{…}' >> reports/{RUN-ID}/progress.jsonl`). 파일 전체를 읽어 Write 로 다시 쓰는 방식 금지 — 병렬 모드에서 다른 세션의 줄이 유실된다.

```json
{"ts":"2026-05-02T14:30:42","run_id":"RUN-20260502-1430-dev","scenario":"01-회원가입","tc":"TC-01","result":"PASS","wait_ms":3214,"in_tokens":1280,"out_tokens":3450,"screenshot":["screenshots/signup-tc01-01-before.png"],"note":""}
```

필드 설명:
- `result`: `"PASS"` / `"FAIL"` / `"SKIP"` / `"BLOCKED"` (선행 TC 결과에 의존해 실행 불가한 경우)
- `wait_ms`: **AI 작업 시간** — 프롬프트 전송→편집 완료 실측(밀리초, `browser_evaluate(Date.now())` 두 번 차이). 측정할 AI 동작이 없으면 `null`
- `in_tokens` / `out_tokens`: **토큰 소모량** — 응답 완료 후 사이드패널 하단에서 읽은 입력·출력 토큰(정수). 표시 없거나 프롬프트 없는 TC 면 각각 `null`
- `note`: 아래 **note 작성 규칙** 참조
- `screenshot`: 관련 스크린샷 상대경로 배열

#### note 작성 규칙

**목적**: 대시보드에서 한눈에 읽히는 문구. 기술 용어·내부 구현 없이 **무엇이 안 됐는지**만 전달.

| 규칙 | 내용 |
|---|---|
| 길이 | **60자 이내**. 초과하면 잘라낸다 |
| 구분자 | 원인과 결과가 둘일 때 **`;`** 로 분리 |
| 언어 | 평이한 한국어. 영문 도구명·API명 최소화 |
| PASS | 주목할 관찰이 없으면 **빈 문자열 `""`**. 특이사항이 있을 때만 한 줄 |
| FAIL | `{무엇}이 {어떻게} 안 됨` 패턴으로 핵심 하나 |
| BLOCKED | `{사전조건} 없어 검증 불가; {AI/시스템} 응답 상태` |

**좋은 예**

```
"정렬 미적용; 테두리는 적용됨"
"파이 차트 생성됐으나 데이터 레이블 미표시"
"본문에 표가 없어 검증 불가; AI는 응답했으나 적용 대상 없음"
"AI 거절 + 대안 제시, 본문 변경 없음"
"14pt·Bold·연회색 배경 모두 적용"
```

**피해야 할 예**

```
"TC-06 결과(AI가 기존 native 슬라이드 modify 회피) 로부터 동일 한계 예상 — 시간 제약으로 미실행"  ← 너무 긺
"format_text_blocks 의 contentIndexes 매핑 또는 fontSize 적용 로직 버그"  ← 내부 구현 노출
"시나리오 사전조건 미달 - 'II. 상반기 실적 검토' 아래 표가 본문에 없음 (글머리 기호 목록 형태). AI 응답 완료했으나 적용 대상 표 부재로 디자인 변화 시각 검증 불가"  ← 길고 반복
```

> ⚠️ **중요**: 이 단계를 건너뛰면 안 됩니다. 중간 중단 시 결과 보존을 위해 반드시 TC마다 즉시 기록하세요.

### 6) 다음 TC 진행
이전 TC 의 dirty state 가 영향을 줄 수 있으면 명시적으로 정리 (로그아웃·캐시 클리어 등).

---

## 시나리오 종료 후

### 1) 정식 결과 마크다운 작성
`reports/{RUN-ID}/{scenario-slug}_result.md` 를 다음 구조로 작성:

```markdown
# {시나리오명} — 실행 결과

**RUN-ID**: ...
**환경**: ...
**시간**: HH:MM:SS ~ HH:MM:SS (Xm Ys)
**결과**: ✅ N Pass / ❌ M Fail

## 사용자 흐름
(시나리오 명세의 흐름 요약)

## TC-XX: {이름} — ✅ PASS / ❌ FAIL
- 입력: ...
- 단계별 결과:
  1. ... ✓
  2. ... ✓
- 스크린샷: `screenshots/...`
- (실패 시) 기대: ... / 실제: ... / 추정 원인: ...

(모든 TC 반복)

## 정책 참조
- `specs/...`
```

### 2) `reports/data.js` 갱신 (대시보드 즉시 반영)

시나리오가 끝날 때마다 다음 절차로 `reports/data.js` 를 **풀 빌드 + 덮어쓰기**. 대표님이 도중에 대시보드를 열어도 직전 시나리오까지의 결과가 보이도록 하기 위함.

알고리즘:
1. **카탈로그 빌드**: `scenarios/*.md` (단, `_template.md` 제외) 전체를 파일명 오름차순으로 스캔. 각 파일에서 시나리오 ID(파일명 stem) · TC 목록(TC-XX + 이름) 추출.
2. **결과 맵 빌드**: `reports/{RUN-ID}/progress.jsonl` 전체 read. `(시나리오, TC)` 키로 최신 result(`PASS`/`FAIL`/`SKIP`/`BLOCKED`) 매핑.
3. **머지**: 카탈로그 위에 결과 맵 오버레이.
   - PASS → `status: "PASS"`
   - FAIL/SKIP/BLOCKED → `status: "FAIL"` (대시보드는 PASS/FAIL/— 3분기만 인식)
   - 결과 없음 → `status: "—"` (미실행)
   - **TC별 옵션 필드 주입** (대시보드 스크린샷 모달용):
     - `screenshots`: progress.jsonl 의 `screenshot` 배열을 `reports/` 기준 상대경로로 변환 (`screenshots/foo.png` → `{RUN-ID}/screenshots/foo.png`). 누락된 `screenshots/` prefix 는 보정.
     - `note`: progress.jsonl 의 `note` 그대로.
     - `run_id`: 결과를 가져온 RUN-ID.
     - `duration`: **AI 작업 시간** — progress.jsonl 의 `wait_ms` 를 `"{round(wait_ms/1000)}s"` 로 변환 (예: `3214` → `"3s"`). `wait_ms` 가 `null`/누락이면 이 필드 생략 (대시보드가 `—` 표시).
     - `in_tokens` / `out_tokens`: **토큰 소모량** — progress.jsonl 의 `in_tokens`·`out_tokens`(정수)를 1000 단위 축약 문자열로 변환 (예: `1280` → `"1.3k"`, `850` → `"850"`). 각각 `null`/누락이면 해당 필드 생략 (대시보드가 `—` 표시).
     - 결과 없음 TC 는 이 필드들 모두 생략.
4. **KPI 재계산** (`kpis` 객체):
   - `pass`: 전체 PASS 개수
   - `fail`: 전체 FAIL 개수
   - `pass_rate`: `round(pass / (pass+fail) * 100)` — pass+fail = 0 이면 `null`
   - `scenario_count`: 카탈로그 시나리오 수
   - `tc_count`: 카탈로그 TC 총수
5. **`meta` 갱신**: `run_id`, `env`, `updated_at`(현재 시각 `YYYY-MM-DD HH:MM`)
6. **유지**: `issues`, `history`, `kpis.total_runs`, `kpis.runs_by_env`, `kpis.open_issues`, `kpis.issues_breakdown` 은 **기존 `data.js` 에서 그대로 read 해서 다시 씀**. 이 영역은 메인 Claude 가 RUN 단위로 마무리에 갱신함.
7. **빈 카탈로그 방어**: `scenarios/` 가 비어 있거나 스캔 실패 시 기존 `data.js` 보존, 메인 반환 요약에 한 줄 경고.

> ⚠️ **한 세션 안에서 동시 실행 금지**: 같은 Claude Code 세션은 Playwright MCP 서버(=브라우저)가 하나라 fork 여러 개가 같은 탭을 놓고 충돌한다. 시나리오는 세션 내 순차 dispatch 가 원칙.
>
> ℹ️ **병렬 모드(세션 분리)일 때**: 터미널별 Claude Code 세션이 각자 브라우저를 띄우고 **같은 RUN-ID** 를 공유하며 서로 다른 시나리오를 돌린다. 이 경우 `data.js` 는 마지막에 끝난 세션의 빌드가 남는데, 위 알고리즘이 `progress.jsonl` 전체를 다시 읽는 풀 빌드라 결과적으로 모든 시나리오가 반영된다. 두 세션이 동시에 쓰는 순간의 race 는 **RUN 마무리 세션의 재빌드**로 흡수하므로 허용. 절차는 `CLAUDE.md` 의 "병렬 실행 모드" 참조.

> ℹ️ 버전 스냅샷(`reports/versions/v{N}.js` · `versions.js`)은 **메인 Claude 가 RUN 종료 시 1회** 처리한다. Skill 은 `data.js`(최신)만 쓰고 버전 파일에는 관여하지 않는다.

### 3) `scenarios/{시나리오}.md` 하단 "최근 실행 결과" 표 갱신

자기 시나리오 파일 하단의 표에 **이번 RUN 1줄 추가** (또는 기존 표가 빈 양식이면 첫 줄로 채움). 형식:

```markdown
| 일시 | 환경 | 결과 | RUN-ID | 비고 |
|---|---|---|---|---|
| 2026-05-02 14:30 | dev | ✅ 4/5 | RUN-20260502-1430-dev | TC-04 인증 메일 fail |
| (이전 행들...) |
```

최신이 위로. 행 5개까지만 유지 (오래된 건 잘라냄).

### 4) 메인에 반환할 요약 (300단어 이내)

다음 구조로만 반환. **불필요한 상세 내용·스크린샷 본문·DOM 덤프 절대 포함 금지**.

```markdown
## 시나리오 실행 결과
- **시나리오**: 01-회원가입
- **RUN-ID**: RUN-20260502-1430-dev
- **환경**: dev
- **결과**: 4/5 Pass (1 Fail)
- **소요시간**: 1m 42s
- **결과 파일**: reports/RUN-20260502-1430-dev/01-회원가입_result.md

### 신규 실패
- TC-04: 인증 메일 재전송 시 메일 미수신 (60s timeout)

### 연속 실패
- 없음

### 권장 액션
- TC-04 메일 발송 큐·SMTP 설정 점검 요청
```

---

## AI채팅 HWPX 진입·검증 절차 (구 HWPX 생성·편집 시나리오 — 현재 scenarios/ 에는 없음. SCN-01~03 은 매뉴얼 에이전트 비교 시나리오이므로 혼동 주의)

현재 활성 시나리오는 HWPX 2종(`scenarios/01-HWPX-생성.md`, `02-HWPX-편집.md`)이다. 대상은 **하이웍스 AI채팅**(전용 풀페이지 앱)이 자연어 요청으로 **한글 문서(HWPX) 파일을 생성·편집**하는 기능이다. 산출물은 인라인 본문이 아니라 **다운로드/미리보기 가능한 `.hwpx` 파일**이며, 검증은 **다운로드 파일의 실측(OPC 구조·section0.xml 네이티브 텍스트)** 으로 한다.

> ⚠️ **메일·OnlyOffice 시대와 완전히 다르다.** 메일 쓰기 페이지 우측 사이드패널이 아니라, **AI채팅 전용 앱**(`feature-hwp-skill-ai-chat.devoffice.hiworks.com`)의 메인 채팅 입력창이다. 아래 절차만 따르고, 그 밑의 "메일 사이드패널"·"DOCX/PPT/Excel" 섹션은 **레거시 참조용**이다.

### 진입 사전점검 (PRE-FLIGHT) — 시나리오마다 필수

첫 TC 조작·캡처보다 먼저 아래를 통과시킨다.

1. **로그인**: `environments/{env}.md` 의 로그인 URL(예 `devoffice.hiworks.com/joy1.com`) → ID 는 보통 pre-fill, 비밀번호 입력 후 로그인. 로그인 후 대시보드로 이동.
2. **AI채팅 진입**: `browser_navigate` 로 `https://feature-hwp-skill-ai-chat.devoffice.hiworks.com` → `/c/new`(빈 새 대화) 로딩 확인.
3. **뷰포트**: `browser_resize({ width: 1440, height: 1440 })` 1회.
4. **코드 인터프리터 ON 확인(필수)**: 입력창 하단 **`도구 모음`** 버튼 클릭 → 다이얼로그의 **`코드 인터프리터`** 스위치가 **checked** 인지 확인(기본 켜짐). 꺼져 있으면 켠다. 확인 후 `도구 모음` 다시 눌러 닫기. (이게 꺼지면 파일 생성 자체가 안 됨.)
5. **모델 확인**: 입력창 우하단 **모델 선택 버튼**이 시나리오 지정 모델(현행 **Gemini 3.1 Pro**)인지 확인. 다르면 클릭해 변경하고, 회차 비고·result.md 에 어떤 모델로 돌렸는지 기록.
6. **(선택) 좌측 채팅기록 사이드바 접기**: 캡처를 깔끔히 하려면 `사이드바 토글` 클릭. DOM 은 남지만 캡처 폭 확보에 도움. 필수는 아님(전체 뷰포트 캡처 원칙엔 지장 없음).

→ 실패 항목은 메인 반환 요약에 한 줄 보고. **각 TC 는 원칙적으로 빈 새 대화(`/c/new`)에서 독립 시작**하되, **SCN-02 이어 편집(TC-01→02→03→04, 그리고 방향형 06·07)은 같은 대화에서 순차 진행**한다(앞 편집 결과가 다음 편집 기준).

### 입력·전송 (검증된 패턴)

1. 메인 입력창은 `main div[contenteditable="true"]` (또는 role=textbox). `browser_click` 으로 포커스 → `browser_type` 으로 시나리오 프롬프트를 **그대로** 입력.
2. **`02-prompt` 캡처**(전체 뷰포트, 전송 전 — 프롬프트 텍스트가 보임).
3. **`t_send = browser_evaluate(() => Date.now())` (필수, Enter 직전)** → 곧바로 `browser_press_key("Enter")` 로 전송. (전송 버튼 대신 Enter 권장.)
4. 전송하면 URL 이 `/c/{새 대화ID}` 로 바뀐다 — 그 대화에 머문다.

### 완료 감지 — `browser_evaluate` 폴링 (핵심)

⚠️ **`browser_wait_for(text)` 는 MCP 백엔드에서 ~5초에 잘린다** — 긴 생성(60~115초)엔 못 쓴다. 대신 `browser_evaluate` 로 `document.body.innerText` 를 폴링한다:

```js
() => { const now = Date.now(); const b = document.body.innerText;
  return {
    elapsed_s: Math.round((now - T_SEND)/1000),
    done: b.includes('파일 생성이 완료'),
    files: [...new Set((b.match(/[\w가-힣_]+\.(hwpx|pdf|png)/g)||[]))],
    tokens: (b.match(/input:\s*[\d,]+\s*\|\s*output:\s*[\d,]+\s*\|\s*total:\s*[\d,]+/)||[])[0] || null
  }; }
```

- **완료 판정**: 응답 스트리밍이 멈추고 **파일 카드(`.hwpx`+선택적 `.pdf`) 또는 하단 파일 링크가 나타나며 토큰 줄(`input: N | output: M | total: T`)이 붙은** 시점. 회차에 따라 "파일 생성이 완료되었습니다" 카드가 없이 **파일 링크만** 오기도 하므로, 파일명(`*.hwpx`)+토큰 등장을 종합 판정한다. (`base.hwpx` 는 스킬 내부 참조명이니 **최종 산출 파일명과 구분**한다.)
- **완료 즉시 `t_done` 을 1회 읽는다** → `wait_ms = t_done - t_send`. 폴링 간격 때문에 몇 초 오차는 정상 기록(부풀리지 말 것). **HWPX 생성은 다단계라 60~115초가 정상** — 시간만으로 FAIL 하지 말 것(스톨 규칙은 아래).
- **토큰**은 위 정규식으로 읽어 `in_tokens`/`out_tokens` 정수 기록.
- **멀티 응답 대화(SCN-02 이어 편집)**: 매 편집이 **새 파일명**(예 `_수정`→`_최종`→`_이름만`)을 만들거나 새 토큰 줄을 추가하므로, **직전 대비 새로 등장한 파일/토큰**으로 그 턴의 완료를 판정한다.

### 🔴 스톨 = FAIL 규칙 (ISS-108, 실측)

`hwp` 스킬 스텝이 **`Completed`** 로 표시된 뒤에도 **최종 파일이 산출되지 않고 출력 토큰이 낮은 값(예 261/309)에서 멈춘 채 응답이 정지**하는 스톨이 관측된다(생성 TC-05 서식+특수문자, 편집 TC-05 업로드 경로). 판정:
- turn 종료(중지 버튼 없음·스트리밍 클래스 없음) + 파일 링크 없음 + 출력 토큰 정지가 **60초+** 지속되면 **FAIL**, `note`: "hwp Completed 후 파일 미산출·응답 정지". `wait_ms: null`.
- 실패 화면(hwp Completed·파일 없음)을 `03-after` 로 1장 캡처.

### 다운로드 + 실측 검증 (미리보기 백지여도 가능)

미리보기 렌더는 불안정하다(우측 전용 패널 백지, 인라인 `page.png` 가 1×1 placeholder 로 오거나 미동반 — ISS-109). 따라서 **다운로드 파일 실측이 1순위 검증**이다.

1. 하단 파일 목록/카드의 **`*.hwpx`(+있으면 `.pdf`)** 텍스트를 클릭 → 다운로드. MCP 는 `.playwright-mcp/{파일명}.{ext}` 로 받는다(파일명은 공백·`_`→`-` 로 슬러그화됨).
2. `Bash` 로 `reports/{RUN-ID}/downloads/` 로 이동(`mv`). SCN-02 처럼 같은 문서가 여러 번 나오면 `tc0N-` prefix 로 구분 저장.
3. **HWPX 실측**:
   - 유효성: `unzip -l file.hwpx` → `mimetype`·`Contents/section0.xml`·`Contents/header.xml`·`META-INF/container.xml` 존재(정상 OPC).
   - 내용: `unzip -p file.hwpx Contents/section0.xml | sed 's/<[^>]*>/\n/g' | grep -vE '^\s*$'` 로 본문 텍스트를 뽑아 **요청 요소(제목·표 셀·목록 항목·수치·일시/장소/연락처 등)** 존재·값을 확인. **표/목록 텍스트가 여기 네이티브로 있으면 이미지가 아닌 진짜 구조**임이 확인된다.
   - 편집(SCN-02): **바뀐 값 반영 + 옛값 잔존 없음 + 미수정 부분 보존**을 grep 으로 대조. (paragraph `id="..."` 같은 구조 속성이 숫자에 매칭될 수 있으니 문맥 확인.)
4. 인라인 미리보기 이미지(`page.png`)가 실제로 렌더된 회차면 그 이미지를 열람용으로 `03-after` 캡처에 포함하면 좋다(없으면 채팅 결과 상태 캡처 + 다운로드 실측으로 갈음).

### 멀티턴 명확화 (모호/과소·방향형 요청)

모호 요청("한글 문서 하나 만들어줘")·주제만("워크숍 문서")·방향형 편집("격식있게")에서 AI 가 **인터랙티브 입력 폼**(문서 종류 버튼 + `직접 입력` + 제목/내용 텍스트필드 + AI추천 + `문서 생성하기`/`작성 시작`)으로 되묻는다.
- 폼 필드를 시나리오의 "되물음 대응 예시" 값으로 채운다: 종류는 `직접 입력` 버튼 클릭 후 나타나는 필드에, 제목/내용은 각 텍스트필드/textarea 에 `browser_type`. 날짜는 `input[type=date]` 에 `YYYY-MM-DD`.
- 폼(되물음)은 `03-clarify`, 채운 폼은 `04-answer`, 최종 결과는 `05-after` 로 캡처. **`t_send` 는 `문서 생성하기`/`작성 시작` 클릭 직전에 읽어** 생성 단계 wait_ms 를 잰다. `note` 에 총 턴 수 기록.
- AI 가 되물음 없이 바로 편집/생성하면(문맥 충분) 그대로 진행 — 1턴 PASS.

### 파일 업로드 (SCN-02 TC-05)

`도구 모음`(또는 `+`) → **`파일 업로드`** 탭 클릭 → 파일 선택창이 뜨면 `browser_file_upload({paths:["<절대경로 .hwpx>"]})`. 첨부 칩 확인 후 편집 프롬프트 입력·전송. (이 경로에서 스톨 재현된 바 있음 — 위 스톨 규칙 적용.)

### 스크린샷 슬러그·경로

- 슬러그: 생성=`hwpx-create`, 편집=`hwpx-edit`. 파일명 예: `hwpx-create-tc02-02-prompt.png`, `hwpx-edit-tc06-03-after.png`.
- `filename` 은 **프로젝트 루트 절대경로**(`C:/Users/USER/Desktop/Project/QA_hwpx/reports/{RUN-ID}/screenshots/...png`)로 준다(상대경로는 MCP 가 다른 베이스로 해석).
- 전체 뷰포트로만 캡처(`element`/`target` 주지 않음). 프롬프트 있는 TC 기본 2장(`02-prompt`→`03-after`), 멀티턴은 `03-clarify`/`04-answer`/`05-after`.

---

## [레거시] 메일 AI 사이드패널 진입 절차 (구 SCN-01~06, 참조용)

> 구 메일 6종 시나리오는 2026-07-22 삭제됨. 아래는 우측 AI 사이드패널·이중 iframe·LNB 측정 게이트 패턴의 **참조용 보존**이다. 현행 HWPX 에는 적용하지 않는다.

- 메일 쓰기 페이지(`mails.devoffice.hiworks.com/write?mode=normal`)의 우측 `#ai-chat-iframe-panel`. 화면에 LNB 가 둘(① 메일함 목록 — 접는다, ② AI 내부 채팅기록 — 안 건드림). 메일 LNB 접힘은 `[class*="DragResizable_drag"]` 핸들의 `getBoundingClientRect().left` 를 측정해 >150 이면 더블클릭으로 접고 ≤100 확인. 모델은 당시 Claude Sonnet 4.6. 전송은 Enter(전송 버튼은 드로어 backdrop 에 막힘, ISS-005).

---

## [레거시] AI 시나리오 전용 규칙 (DOCX / PPT / Excel, 참조용)

구 AI 시나리오 6종(`scenarios/01-DOCX-실사용흐름.md`, `02-DOCX-객체삽입.md`, `03-PPT-실사용흐름.md`, `04-PPT-객체삽입.md`, `05-Excel-실사용흐름.md`, `06-Excel-객체삽입.md`)에는 다음 세 규칙이 **추가로** 적용된다. (현재 카탈로그엔 없으나 패턴 참조용으로 보존.)

### 1) 진입 경로 — "미리보기 (MCP ver)" 플라스크 아이콘만 사용

드라이브 파일 행에 호버하면 액션 아이콘이 5개 표시된다.

- **첫 번째 "미리보기"** (`title="미리보기"`, `gi gi-new-window` 아이콘) → AI 채팅이 **없는** 기존 편집기. **사용 금지.**
- **두 번째 "미리보기 (MCP ver)"** (`title="미리보기 (MCP ver)"`, `fal fa-flask` 플라스크 아이콘) → AI 사이드패널이 붙은 신규 편집기 (`feature-connector-develop-document.devoffice.hiworks.com` 호스트). **이걸 클릭한다.**

호버 상태가 잘 안 잡히거나 ref 가 사라지면 `browser_evaluate` 로 우회:

```js
const target = Array.from(document.querySelectorAll('*'))
  .find(el => el.textContent === '<파일명>.docx' && el.children.length === 0);
let row = target;
for (let i = 0; i < 8; i++) {
  row = row.parentElement;
  const buttons = row.querySelectorAll('button, [role="button"]');
  if (buttons.length >= 3) { buttons[1].click(); break; }  // index 1 = 플라스크
}
```

이후 흐름: 새 탭 select → 상단 **문서편집** 클릭 → **Hiworks AI** 탭 → **AI 채팅** 버튼 → 우측 사이드패널 활성화. "AI채팅 Pro로 업그레이드 되었습니다" 안내 다이얼로그가 뜨면 닫기.

### 2) 본문 직접 편집 금지 — AI 가 편집하는지를 검증한다

이 시나리오들의 검증 대상은 **AI 사이드패널 자체**다. Skill 이 본문을 직접 수정해버리면 검증이 무의미해진다.

- **허용 (사용자 사전 준비)**: 커서 위치 클릭, 텍스트 선택(드래그), 표·문단 클릭 등 시나리오의 "조작 순서" 가 명시한 위치/선택 동작.
- **금지 (AI 가 해야 할 작업)**: 본문에 직접 타이핑, Enter 로 빈 줄 만들기, 표 삽입, 서식·정렬·글자 크기 변경, 글머리 기호 적용 등.

진행 패턴:

1. (필요 시) 시나리오가 요구하는 커서 위치 / 텍스트 선택만 본문에서 수행
2. 시나리오의 프롬프트를 AI 사이드패널 채팅창에 **그대로** 입력 → 전송
3. AI 응답 대기, "본문에 삽입" 같은 액션이 있으면 그것만 클릭
4. 본문 결과를 스냅샷·스크린샷으로 캡처해 "기대 결과"·"검증 포인트" 와 비교
5. PASS / FAIL 판정

사전조건 미달(예: 빈 단락이 없어서 커서 위치 잡을 곳이 없음)이면 그 자체로 시나리오 진행 불가다. 다른 파일을 고르거나 시나리오 갱신을 권고할 것 — **빈 줄을 직접 만들어 검증을 위조하지 말 것.**

### 3) OnlyOffice/Hiworks 에디터 조작 실무 (검증된 패턴)

ONLYOFFICE 편집기는 일반 DOM 페이지와 다르게 동작한다. 아래는 실측으로 확인된 패턴이다.

- **첫 로드 시 CORS/PNA 차단 → 새로고침 1회로 복구**: `문서편집` 진입 직후 화면이 **백지**이고 콘솔에 `Error load DocsAPI` + *"Permission was denied for this request to access the `local` address space"*(Chrome Private Network Access) 가 보이면, OnlyOffice `api.js` 가 차단된 것이다. **`/edit` URL 로 한 번 새로고침**(`browser_navigate` 재호출)하면 정상 로드된다. 새로고침 후 에디터 캔버스·툴바가 뜰 때까지 **5~10초 대기**. 이 백지 상태를 FAIL 로 오판하지 말 것 (인프라 이슈이며 메인 반환 요약에 1줄로 보고).
- **2중 iframe 구조**: 에디터 본체는 cross-origin iframe `frameEditor`(스냅샷 ref `f1e*`), 우측 AI 패널은 별도 iframe `#ai-chat-iframe-panel`(ref `f2e*`). parent 의 `browser_evaluate` 로는 내부 DOM 접근 불가하지만, **`browser_snapshot` 은 로드 후 두 iframe 내부까지 들어가** `f1e*`/`f2e*` ref 를 잡는다. 에디터가 덜 떴을 때 스냅샷이 비면 잠시 더 기다린 뒤 재시도.
- **본문은 canvas 렌더 — 텍스트가 접근성 트리에 안 잡힌다**: 문서/시트/슬라이드 본문 글자는 스냅샷에 안 나온다. 내용 검증은 **스크린샷(시각)** 으로 한다. 본문 스크롤은 `#id_main` 클릭(커서 포커스, 위치 지정만) 후 `browser_press_key('Control+End')` 등으로, 전체 문서를 한 장에 크게 보려면 `browser_take_screenshot` 의 `element` 를 editor iframe 의 `#id_main` 으로 스코프(`-zoom` suffix). 표·셀이 실제 표인지(이미지 아님)는 오른쪽 메뉴의 `표 설정` 버튼이 커서 진입 시 활성화되는지로 보조 확인.
- **토큰 읽는 위치**: 각 응답 말미에 `Tokens / input: N | output: M | total: T` 줄이 붙는다. 여기서 `in_tokens`/`out_tokens` 정수를 읽는다.
- **스크린샷 경로는 절대경로**: `browser_take_screenshot` 의 `filename` 은 **프로젝트 루트 안 절대경로**(`C:/Users/.../QA_onlyoffice_v2/reports/{RUN-ID}/screenshots/...png`)로 준다. 상대경로는 MCP 가 다른 베이스로 해석해 `File access denied` 가 난다.
- **AI 채팅 입력 → 전송 (Enter 전송 권장)**: 입력창(`f2e*` textbox)에 `browser_type` 으로 프롬프트 입력 → `02-prompt` 캡처 → **`t_send = browser_evaluate(() => Date.now())` (필수, 빼먹으면 wait_ms 가 null) → 곧바로 입력창 포커스 상태에서 `Enter` 키로 전송**. 모델은 시나리오 지정값(현재 `GPT 5.4`)인지 패널 하단 모델 선택 버튼으로 확인. "AI채팅 Pro로 업그레이드 되었습니다" 다이얼로그는 닫기(X).
- **전송은 무조건 Enter — `전송` 버튼 클릭 금지 (ISS-005)**: AI 채팅 패널의 `전송` 버튼은 LNB 드로어 backdrop(`fixed inset-0 z-50`)이 떠 있으면 클릭이 가로막힌다. 그러니 **버튼을 누르지 말고 입력창 포커스 상태에서 항상 `Enter`** 로 전송한다(위 "AI 채팅 입력 → 전송" 항목과 동일). `t_send` 는 반드시 **Enter 직전**에 읽는다. 혹시 막혀 전송이 밀린 TC 는 그 TC 의 wait_ms 를 `null` 처리.
- **AI 채팅 내부 사이드바(채팅기록) 처리 — 패널 폭에 따라 정반대다. 메일 패널에선 토글을 누르지 말 것**:
  - **넓은 패널(레거시 DOCX/PPT/Excel, 인라인 목록 모드)**: 좌측 목록(`새 대화`·`즐겨찾기`·`채팅기록`)이 기본 펼쳐져 캡처를 가릴 수 있다. 이때만 좌상단 `사이드바 토글`을 눌러 **접고**(아이콘 레일만 남는지 스냅샷 검증) 캡처한다.
  - **좁은 패널(메일 패널 400px, 모바일 드로어 모드) — 구 메일 패널 SCN-01~05**: 채팅기록은 **기본적으로 닫힌 드로어**라 채팅 영역이 이미 보인다. 여기서 `사이드바 토글`을 누르면 목록이 *접히는 게 아니라* **backdrop(`fixed inset-0 z-50`) 딸린 드로어가 펼쳐져** 채팅을 통째로 가린다. ⇒ **메일 패널에선 토글을 누르지 않는다.** 기본 상태 그대로 캡처.
  - ⚠️ **드로어가 열려버렸을 때 복구**: `Escape` 는 **안 먹힌다**(실측). `사이드바 토글`을 **다시 클릭**해 닫는다. backdrop 이 일반 클릭을 가로막으면 `browser_evaluate` 의 `target` 에 토글 ref 를 주고 `(el)=>el.click()` 으로 **JS 클릭**한다. (전체 패널을 닫았다 다시 여는 것만으론 드로어 상태가 유지돼 안 풀린다.)
  - 그래도 안 풀리면 폴백: 결과 캡처를 본문/패널 영역으로 **스코프(`-zoom` suffix)** 해 가려진 부분을 프레임 밖으로 뺀다.
  - **자기점검**: `03-after` 저장 직후 이미지를 Read 로 열어 **채팅 응답·토큰 영역이 드로어/목록에 가리지 않았는지** 눈으로 확인. 가렸으면 위 절차로 닫고 재캡처.
- **빈 문서 사전조건 복원 (커넥터 자동저장)**: AI 시나리오 1단계(백지 작성)는 빈 DOCX/시트/슬라이드를 전제하나, 커넥터가 **시험 모드에서도 변경분을 자동저장**(상태바 "모든 변경 사항이 저장되었습니다")해 직전 회차 산출물이 그대로 남아 있을 수 있다. 이 경우 본문 클릭 → `Ctrl+A` → `Delete` 로 **백지만 복원**한 뒤 진행한다. 이는 환경 초기화이며 AI 가 해야 할 작업(타이핑·서식·표 삽입) 위조가 아니다 — 결코 본문에 내용을 직접 채우지 말 것. 복원 사실은 result.md 에 1줄 남긴다.

---

## 중요 규칙

- **민감 정보 보호**: `environments/*.md` 의 비밀번호·토큰 등은 `progress.jsonl`, `result.md`, 메인 반환 요약 어디에도 절대 포함 X
- **prd 환경 주의**: 환경이 `prd` 이고 데이터 변경 시나리오면, 실행 전 메인 Claude 에게 한 번 더 명시적 확인 요청
- **실패 처리**: TC 가 실패해도 시나리오 끝까지 계속 진행 (조기 abort 금지). 단, 후속 TC 가 실패한 TC 결과에 의존하면 `BLOCKED` 처리
- **타임아웃**: 일반 TC 는 60초 기준이나, **HWPX 생성·편집은 다단계라 60~115초가 정상**이므로 시간만으로 FAIL 하지 않는다. 판정 기준은 **시나리오 전체 5분** 예산 + **스톨 감지**(hwp Completed 후 파일 미산출·응답 정지 60초+ → FAIL, ISS-108). 진짜 응답이 진행 중(스트리밍·reasoning 갱신)이면 5분 내에서 기다린다.
- **브라우저 정리**: 시나리오 끝나면 페이지·컨텍스트 닫음
- **컨텍스트 절약**: 메인에 반환할 때는 요약만. 스크린샷·DOM·콘솔 로그는 디스크에만 남기고 반환값에 포함 X
