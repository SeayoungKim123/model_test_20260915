# 매뉴얼 에이전트 비교 — Q01~Q10 (Claude Sonnet 5) — 실행 결과

**RUN-ID**: RUN-20260908-1156-dev
**환경**: dev (매뉴얼 에이전트 O)
**모델**: Claude Sonnet 5
**계정**: 일반 사용자1 (계정 ID 는 environments/dev.md 참조)
**실행 범위**: **TC-09 단독 재실행 (회차 2)** — TC-01~08·TC-10 은 이번 dispatch 대상이 아니며 미실행(기록 없음)
**시간**: 11:59:50 ~ 12:00:30 (약 40s, TC-09 1건)
**결과**: ✅ 1 Pass / ❌ 0 Fail (판정 기준: "응답 성립" 여부만, 답변 품질·정확도는 사람이 비교)

## 사전점검
- 로그인: `devoffice.hiworks.com/joy1.com` → 일반 사용자1(hakyoung) 계정 로그인. 최초 시도 시 로그인 API 가 일시적으로 500 오류(`일시적 문제가 발생하였습니다`)를 반환했으나 비밀번호 재입력 후 재시도로 정상 로그인됨(하이웍스 로그인 백엔드 일시 이슈로 추정, 이번 TC 실행과 무관).
- AI채팅 진입: `https://ai-chat.devoffice.hiworks.com/` → `/c/new` 새 대화 정상 진입
- 뷰포트 1440x1440 고정
- 모델: 새 대화 진입 시 기본값이 이미 **Claude Sonnet 5** — 별도 변경 불필요
- 매뉴얼/에이전트 전용 토글은 화면에 노출되지 않음 — 기본 상태로 진행
- "AI채팅 Pro로 업그레이드 되었습니다" 안내 다이얼로그 닫음

## TC-09: 하이웍스 내 AI 모델 제공 범위 — ✅ PASS
- 질문: `지피티 제미나이 클로드 유료인데 하이웍스에서 사용 하는건 뭐야?`
- wait_ms: 39554 (약 39.6초) / 토큰: input 50,906 · output 752 · total 51,658
- 답변 요지: 하이웍스 AI채팅이 ChatGPT(OpenAI)·Gemini(Google)·Claude(Anthropic) 세 모델을 모두 지원하며 상단 메뉴에서 직접 선택/전환 가능하다고 정확히 안내. 각 모델 구독료를 별도 결제할 필요 없이 하이웍스 안에서 한 번에 이용 가능하다는 점도 언급. 지금 대화 자체가 그 AI채팅 기능으로 실행 중임을 부연.
- 근거 문서 인용: 없음 / 되물음: **없음** (직전 회차인 RUN-20260907-1622-dev 에서는 모델 단정을 회피하며 되물음으로 종료됐던 것과 차이 — 이번 재실행은 1턴에 완결)
- 스크린샷: `screenshots/agent-cmp-dev-tc09-02-prompt.png`, `screenshots/agent-cmp-dev-tc09-03-after.png`

## 정책 참조
- Confluence — [비교 테스트_하이웍스 매뉴얼 에이전트](https://confluence.gabia.com/spaces/AIDEVUNIT/pages/286789889)
