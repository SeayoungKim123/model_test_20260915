# 매뉴얼 에이전트 비교 — Q01~Q10 (Claude Sonnet 5) — 실행 결과

**RUN-ID**: RUN-20260908-1156-prd
**환경**: prd (매뉴얼 에이전트 X)
**모델**: Claude Sonnet 5
**계정**: 일반 사용자1 (계정 ID 는 environments/prd.md 참조)
**실행 범위**: **TC-09 단독 재실행 (회차 2)** — TC-01~08·TC-10 은 이번 dispatch 대상이 아니며 미실행(기록 없음)
**시간**: 12:07:57 ~ 12:09:00 (약 63s, TC-09 1건)
**결과**: ✅ 1 Pass / ❌ 0 Fail (판정 기준: "응답 성립" 여부만, 답변 품질·정확도는 사람이 비교)

## 사전점검
- 로그인: `office.hiworks.com/hiworks04.pe.kr` → 일반 사용자1(jakie) 계정 신규 로그인(직전 dev 세션과 계정 혼동 없이 prd URL로 새로 진입)
- AI채팅 진입: `https://ai-chat.office.hiworks.com/c/new` 새 대화 정상 진입
- 뷰포트 1440x1440 고정
- 모델: 새 대화 진입 시 기본값이 이미 **Claude Sonnet 5** — 별도 변경 불필요
- 매뉴얼/에이전트 전용 토글은 화면에 노출되지 않음 — 기본 상태로 진행 (prd 환경 특성상 에이전트 관련 토글 자체 부재)
- "AI채팅 Pro로 업그레이드 되었습니다" 안내 다이얼로그 닫음

## TC-09: 하이웍스 내 AI 모델 제공 범위 — ✅ PASS
- 질문: `지피티 제미나이 클로드 유료인데 하이웍스에서 사용 하는건 뭐야?`
- wait_ms: 22507 (약 22.5초) / 토큰: 화면 미표시로 input/output 모두 null
- 답변 요지: 하이웍스 AI채팅이 ChatGPT(GPT 계열)·Google Gemini·Anthropic Claude 세 모델을 모두 탑재해 상단 모델 선택 영역에서 직접 골라 쓸 수 있다고 정확히 안내. 각 서비스를 따로 유료 구독하지 않아도 하이웍스 안에서 세 모델 모두 이용 가능하다는 점을 핵심 장점으로 언급.
- 근거 문서 인용: 없음 / 되물음: **없음** (1턴에 완결)
- 스크린샷: `screenshots/agent-cmp-prd-tc09-02-prompt.png`, `screenshots/agent-cmp-prd-tc09-03-after.png`

## 정책 참조
- Confluence — [비교 테스트_하이웍스 매뉴얼 에이전트](https://confluence.gabia.com/spaces/AIDEVUNIT/pages/286789889)
