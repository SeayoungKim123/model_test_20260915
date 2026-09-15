# 모델 비교 — B · GPT 5.6 Terra (계정: 일반 사용자2 전용) — 실행 결과

**RUN-ID**: RUN-20260915-1045-dev
**환경**: dev
**계정**: 일반 사용자2
**모델**: GPT 5.6 Terra (전 TC 동일, 선택기 표시값 매 TC 재확인 완료)
**시간**: 10:47:30 ~ 10:54:50 (약 7m 20s)
**결과**: ✅ 5 Pass / ❌ 0 Fail

## 사용자 흐름

`scenarios/_prompts/모델비교-프롬프트.md` 의 P01~P05 원문 질문 5개를 각각 **새 대화**로 시작해 GPT 5.6 Terra 에 전송하고, 응답 성립 여부·체감 대기(wait_ms)·토큰 소모량·시각화 형태·글자 깨짐 여부를 실측했다. 짝 시나리오(`01-모델비교-A-Sonnet5`, 일반 사용자1/Claude Sonnet 5)와 동일 환경(dev)·동일 프롬프트로 비교 원천 데이터를 구성한다.

## TC-01: 업무형 AI 에이전트 워크플로우 설계 (Salesforce Agentforce 사례) — ✅ PASS
- wait_ms: 32,959 (약 33s) / in_tokens: 26,320 / out_tokens: 1,770
- 응답: 챗봇 기획 vs 워크플로우형 에이전트 비교표, 설계 6단계, B2B 선검증 4축을 정리. Agentforce 관련 환각 서술 없음.
- 시각화: 표(비교표)
- 특이사항 없음(글자 깨짐 없음, 근거 인용 없음, 되물음 없음)
- 스크린샷: `screenshots/model-cmp-terra-dev-tc01-02-prompt.png`, `screenshots/model-cmp-terra-dev-tc01-03-after.png`

## TC-02: AI 에이전트 워크 그래프 개념과 구조화 방법 — ✅ PASS
- wait_ms: 97,180 (약 97s) / in_tokens: 19,639 / out_tokens: 3,701
- 응답: "워크 그래프"를 조직의 일하는 맥락을 AI가 읽을 수 있게 연결한 지식 구조로 정의하고, 사람·업무·권한·의존성 4요소 구조화 원칙을 설명. 인포그래픽 PNG(`ai-work-graph.png`)를 생성해 노드-엣지 다이어그램으로 시각화.
- 시각화: 이미지 생성(인포그래픽 다이어그램)
- 글자 깨짐 없음, 근거 인용 없음, 되물음 없음
- 스크린샷: `screenshots/model-cmp-terra-dev-tc02-02-prompt.png`, `screenshots/model-cmp-terra-dev-tc02-03-after.png`

## TC-03: AI 시대 PM의 '판단 병목' 개념과 적용 — ✅ PASS
- wait_ms: 43,589 (약 44s) / in_tokens: 2,176 / out_tokens: 1,644
- 응답: '판단 병목'을 "실행·산출은 빨라졌지만 결정 속도가 뒤처지는 현상"으로 정의, 병목 발생 5단계 흐름·기능 우선순위 적용법 표·AI 결과 검증 체크리스트 제공.
- 원문의 특수 따옴표(‘ ’)가 입력창에 정상 반영됨을 확인.
- 시각화: 단계형 다이어그램 + 표
- 글자 깨짐 없음, 근거 인용 없음, 되물음 없음
- 스크린샷: `screenshots/model-cmp-terra-dev-tc03-02-prompt.png`, `screenshots/model-cmp-terra-dev-tc03-03-after.png`

## TC-04: Atlassian 상시 에이전트형 개발 기능과 기획 설계 — ✅ PASS
- wait_ms: 40,968 (약 41s) / in_tokens: 4,454 / out_tokens: 1,758
- 응답: Atlassian의 실제 기능명(Agent loops, Jira Coding Agent, Standards, AI Review, Code Context)을 특정하고 각 기능이 "현재 비공개 얼리 액세스/오픈 베타 단계"임을 정직하게 명시. 백로그·승인 지점·품질 기준 3요소 모두 다룸. 답변 말미에 Atlassian 공식 블로그 출처 링크 인용.
- 시각화: 단계형 다이어그램 + 표(승인 지점·품질 기준)
- 글자 깨짐 없음, 근거 인용 있음(출처 링크), 되물음 없음
- 스크린샷: `screenshots/model-cmp-terra-dev-tc04-02-prompt.png`, `screenshots/model-cmp-terra-dev-tc04-03-after.png`

## TC-05: Mind the Product의 환경적 제품 의사결정과 평가 기준 — ✅ PASS
- wait_ms: 39,690 (약 40s) / in_tokens: 6,041 / out_tokens: 1,936
- 응답: Mind the Product 원문("Product decisions are now environmental decisions")을 정확히 인용하고 출처 링크 제공. 비용(35%)·성능(40%)·에너지(25%) 가중치 100점 평가 기준표와 3가지 구현안(LLM 전체추출/하이브리드/API·구조화연동) 비교 막대 차트를 생성.
- 시각화: 막대 차트 + 표
- **글자 깨짐: 있음** — 본문 중 "따라서 대규모 AI 기능은 ... **"API·구조화 데이터·직접 연동으로 AI 처리가 불필요해질 수 있는가?"**를 먼저 검토해야 합니다" 부분에서 마크다운 굵게(`**`) 기호가 렌더링되지 않고 날것으로 노출됨. 본문 대부분은 정상 렌더되어 판독에는 지장 없어 PASS 유지.
- 근거 인용 있음(출처 링크), 되물음 없음
- 스크린샷: `screenshots/model-cmp-terra-dev-tc05-02-prompt.png`, `screenshots/model-cmp-terra-dev-tc05-03-after.png`, `screenshots/model-cmp-terra-dev-tc05-04-glitch.png`(마크다운 미렌더 크롭)

## 종합 관찰
- 5개 TC 모두 GPT 5.6 Terra 로 정상 응답 성립(PASS). 모델 선택기 표시값은 매 TC 전송 직전 "GPT 5.6 Terra" 로 재확인됨.
- 시각화 형태 분포: 표 3회, 단계형 다이어그램 3회(TC-03·04 는 표와 병행), 이미지 생성(인포그래픽) 1회(TC-02), 차트(막대) 1회(TC-05).
- 응답 시간(wait_ms) 범위: 약 33s(TC-01) ~ 97s(TC-02, 이미지 생성 포함). 이미지/차트 생성이 포함된 TC-02·05 가 상대적으로 오래 걸림.
- TC-04·05 는 실제 출처(Atlassian 공식 블로그, Mind the Product) 링크를 인용했고, 불확실한 기능은 "비공개 얼리 액세스" 등으로 정직하게 표시 — 환각 서술 관찰되지 않음.
- TC-05 에서 마크다운 굵게 기호 미렌더 1건 관찰(경미, PASS 유지).

## 정책 참조
- `scenarios/_prompts/모델비교-프롬프트.md`
- `scenarios/01-모델비교-A-Sonnet5.md` (짝 시나리오)
