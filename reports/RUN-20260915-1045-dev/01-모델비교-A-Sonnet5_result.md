# 모델 비교 — A · Claude Sonnet 5 (일반 사용자1) — 실행 결과

**RUN-ID**: RUN-20260915-1045-dev
**환경**: dev (계정: 일반 사용자1 — 홀수 계정 전용 세션)
**시간**: 10:47:52 ~ 11:00:19 (약 12분 27초, 전체 25분 예산 이내)
**결과**: ✅ 4 Pass / ❌ 1 Fail
**모델**: Claude Sonnet 5 (전 TC 모델 선택기 표시값 재확인, 다른 모델 대체 전송 없음)
**연결 중인 도구**: "+2" 배지 노출 (기본 상태 그대로 유지, 변경 없음)

## 사용자 흐름

`scenarios/_prompts/모델비교-프롬프트.md` P01~P05 원문을 매 문항 새 대화(`/c/new`)에서 Claude Sonnet 5 로 전송. 직접 조작·검색 없이 채팅창 전송 → 응답 관찰만 수행. 판정 기준은 "응답 성립 여부"이며 답변 품질은 사람 비교 몫.

## TC-01: 업무형 AI 에이전트 워크플로우 설계 (Salesforce Agentforce 사례) — ✅ PASS
- wait_ms: 56,315 (56.3s) / in_tokens: 10,304 / out_tokens: 3,786
- 워크플로우 6단계(토픽 정의→관측성) + 챗봇 기획과의 차이 표 + B2B 선검증 지점 4가지를 구조화해 응답. 근거 문서 인용 없음, 되물음 없음.
- 시각화 형태: 표(카드형 + 마크다운 표 혼합)
- 글자깨짐: 없음
- 스크린샷: `screenshots/model-cmp-sonnet-dev-tc01-02-prompt.png`, `screenshots/model-cmp-sonnet-dev-tc01-03-after.png`

## TC-02: AI 에이전트 워크 그래프 개념과 구조화 방법 — ❌ FAIL (타임아웃)
- wait_ms: 244,533 (244.5s) / in_tokens: 45,715 / out_tokens: 18,804
- 코드 인터프리터로 실제 노드/엣지 다이어그램(`ai-agent-work-graph.png`)을 생성하고 개념 설명·5원칙까지 응답 내용 자체는 완결되었으나, **TC 타임아웃 기준(180초)을 64.5초 초과**해 시나리오 규정상 FAIL 처리.
- 참고: 응답 품질은 정상(개념 정의 신중, 노드/엣지 시각화 포함), 순수 소요시간 초과가 사유.
- 시각화 형태: 이미지 생성(다이어그램, 렌더 완료)
- 글자깨짐: 없음
- 스크린샷: `screenshots/model-cmp-sonnet-dev-tc02-02-prompt.png`, `screenshots/model-cmp-sonnet-dev-tc02-03-after.png`

## TC-03: AI 시대 PM 의 '판단 병목' 개념과 적용 — ✅ PASS
- wait_ms: 53,399 (53.4s) / in_tokens: 17,951 / out_tokens: 3,226
- "판단 병목"을 실행 속도가 아닌 의사결정 구조 문제로 정의, Andrew Ng 언급을 근거로 제시. 기능 우선순위 3단계 + AI 결과 검증 3축을 정리.
- 원문의 특수 따옴표(' ')가 입력창에 그대로 반영됨을 `02-prompt` 캡처로 확인.
- 시각화 형태: 표(카드형 구조화 패널)
- 글자깨짐: 없음
- 스크린샷: `screenshots/model-cmp-sonnet-dev-tc03-02-prompt.png`, `screenshots/model-cmp-sonnet-dev-tc03-03-after.png`

## TC-04: Atlassian 상시 에이전트형 개발 기능과 기획 설계 — ✅ PASS
- wait_ms: 65,292 (65.3s) / in_tokens: 18,375 / out_tokens: 4,355
- "2026년 9월 발표"라 명시하며 6개 기능(Code Context, Agent Loops in Jira, Standards & AI Review 등)을 카드 그리드로 제시 + PM 설계 가이드 3원칙 + 체크리스트 표.
- ⚠️ 발표 시점·기능명의 사실 정확성은 사람 확인 필요(환각 가능성 있는 구체적 날짜·제품명 인용).
- 시각화 형태: 카드 그리드 + 표
- 글자깨짐: 없음
- 스크린샷: `screenshots/model-cmp-sonnet-dev-tc04-02-prompt.png`, `screenshots/model-cmp-sonnet-dev-tc04-03-after.png`

## TC-05: Mind the Product 의 환경적 제품 의사결정과 평가 기준 — ✅ PASS
- wait_ms: 70,006 (70.0s) / in_tokens: 18,896 / out_tokens: 4,499
- "Nick Williams, Mind the Product (2026)"의 실제 글 제목("Product decisions are now environmental decisions")까지 실명 인용. 성능·비용·에너지 3축 점수제 + 채점 기준표 + 4개 후보 우선순위 막대그래프 + 우선순위 판단 전 체크리스트 5문항까지 생성.
- 5문항 중 가장 풍부한 시각화(막대그래프 포함).
- 시각화 형태: 막대그래프 + 표 + 인용 카드
- 글자깨짐: 없음
- 스크린샷: `screenshots/model-cmp-sonnet-dev-tc05-02-prompt.png`, `screenshots/model-cmp-sonnet-dev-tc05-03-after.png`

## 요약 관찰
- 5문항 모두 응답 성립(스트리밍 완료). 유일한 FAIL 은 TC-02 의 순수 소요시간 초과(180s 기준 244.5s) — 코드 인터프리터로 PNG 다이어그램을 그리는 절차가 텍스트 응답 대비 오래 걸림.
- wait_ms 분포(PASS 4건): 53.4s ~ 70.0s. TC-02 를 포함하면 시각화 유형에 따라 소요시간 편차가 큼(순수 텍스트+표 대비 이미지 생성 시 3~4배).
- 근거 인용: TC-03(Andrew Ng), TC-05(Nick Williams 실명+글 제목)에서 구체적 인용 확인. TC-01·02 는 인용 없이 일반론으로 답변. TC-04 는 날짜·제품명을 구체적으로 제시했으나 사실 확인 필요.
- 글자 깨짐: 전 TC 없음 (모지바케·대체문자·마크다운 미렌더 미관측).
- 짝 시나리오 `02-모델비교-B-GPT56Terra`(GPT 5.6 Terra, 사용자2)도 같은 RUN-ID 에서 병렬 세션으로 동시 실행되어 `progress.jsonl` 에 TC-01~05 결과가 함께 기록됨(A/B 비교용 원천 데이터 확보).

## 정책 참조
- `scenarios/_prompts/모델비교-프롬프트.md`
- `scenarios/02-모델비교-B-GPT56Terra.md`
