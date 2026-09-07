# 매뉴얼 에이전트 비교 — Q21~Q30 (Gemini 3.7 Flash) — 실행 결과

**RUN-ID**: RUN-20260907-1622-dev
**환경**: dev (매뉴얼 에이전트 O)
**계정**: 일반 사용자3 (changseok@joy1.com)
**모델**: Gemini 3.7 Flash
**시간**: 16:34:00 ~ 16:49:46 (15m 46s)
**결과**: ✅ 10 Pass / ❌ 0 Fail

## 사용자 흐름

하이웍스 사용 문의 30문항 중 21~30번을 AI채팅(`https://ai-chat.devoffice.hiworks.com`)에 매 문항 새 대화로 전송해 답변 내용·응답 속도(wait_ms)·토큰 소모량을 실측·캡처했다. 판정 기준은 "응답 성립" 여부만 — 답변 품질·정확도는 사람이 비교할 몫이므로 FAIL 사유로 삼지 않았다. 직접 조작·검색 없이 채팅창 질문 전송과 관찰만 수행했다. 화면에 매뉴얼/에이전트 전용 토글은 노출되지 않아(연결된 도구: 하이웍스/웹 검색/이미지 만들기/문서 도구) 기본 상태로 진행했다.

## TC-21: 서비스 해지 방법 — ✅ PASS
- 질문: `서비스 해지를 하려면 어떻게 해야해?`
- wait_ms: 44603 / in_tokens: 54009 / out_tokens: 1993
- 답변: My가비아 > 서비스 관리에서 소유자 인증 후 해지 신청, 5단계 절차 + 데이터 영구삭제 경고 + 환불 안내. 매뉴얼 에이전트에 위임하는 과정이 관찰됨(출처 링크 인용은 없음).
- 스크린샷: `screenshots/agent-cmp-dev-tc21-02-prompt.png`, `screenshots/agent-cmp-dev-tc21-03-after.png`

## TC-22: 휴가 취소 방법 (초단문 질의) — ✅ PASS
- 질문: `휴가취소 어떻게해`
- wait_ms: 44457 / in_tokens: 10726 / out_tokens: 2029
- 답변: 결재 진행 중/완료 상태별 취소 방법 구분, 관리자 취소 경로도 안내. 구어체 생략 질의를 정상 이해.
- **관찰**: 응답에 포함된 "상태별 처리 방법 요약" 표 위젯의 본문 셀이 렌더링되지 않음(헤더만 표시, 텍스트 안내는 정상 노출) — 표 위젯 렌더링 이슈로 추정.
- 스크린샷: `screenshots/agent-cmp-dev-tc22-02-prompt.png`, `screenshots/agent-cmp-dev-tc22-03-after.png`

## TC-23: 관리자 변경 문의 (질문 아닌 요청문) — ✅ PASS
- 질문: `관리자 변경 문의합니다`
- wait_ms: 49888 / in_tokens: 37543 / out_tokens: 2162
- 답변: 문의 접수형 문장도 고객센터로 넘기지 않고 스스로 답변. 전체 관리자/서비스별 관리자 구분 + 4단계 변경 절차 + 주의사항 안내.
- 스크린샷: `screenshots/agent-cmp-dev-tc23-02-prompt.png`, `screenshots/agent-cmp-dev-tc23-03-after.png`

## TC-24: 메일 읽음 상태 이상 (장문 상황 서술) — ✅ PASS
- 질문: `새로운 메일을 읽지도 않았는데 읽은것으로 표시되며 새로운 메세지가 왔는지 확인을 해보면 이미 누군가 읽은것 처럼 되어있는데 왜 그런가요?`
- wait_ms: 63205 / in_tokens: 12627 / out_tokens: 2649
- 답변: 30문항 중 최장 서술형 질문에서 핵심 증상을 정확히 추출. POP3 외부 연동/메일 선별 센터/공용메일 공동 열람/계정 도용 4가지 원인 분기 표 + 4단계 점검 순서 + 보안 우려 대응(비밀번호 변경) 안내.
- 스크린샷: `screenshots/agent-cmp-dev-tc24-02-prompt.png`, `screenshots/agent-cmp-dev-tc24-03-after.png`

## TC-25: 직원 초대 방법 — ✅ PASS
- 질문: `하이웍스에 직원을 초청하는 방법을 알려줘`
- wait_ms: 44802 / in_tokens: 11605 / out_tokens: 1995
- 답변: 4단계 등록 절차 + 메뉴 경로/권한 요건 + 라이선스 확인 체크리스트. TC-02(조직도 멤버 등록)와 구별되는 "사용자 계정 생성" 관점의 답변.
- 스크린샷: `screenshots/agent-cmp-dev-tc25-02-prompt.png`, `screenshots/agent-cmp-dev-tc25-03-after.png`

## TC-26: 출근하기 버튼 미동작 — ✅ PASS
- 질문: `출근하기가 안눌러져`
- wait_ms: 50657 / in_tokens: 38011 / out_tokens: 2497
- 답변: 시간/GPS·IP/관리자 설정 원인 분기 + 4단계 자가 점검 절차. 구어체 단문을 정상 이해.
- 스크린샷: `screenshots/agent-cmp-dev-tc26-02-prompt.png`(prompt), `screenshots/agent-cmp-dev-tc26-03b-after.png`(상단 카드), `screenshots/agent-cmp-dev-tc26-03-after.png`(하단 상세+토큰) — 답변이 1화면을 넘어 다장 캡처

## TC-27: 전체공유 캘린더 공유대상 추가 — ✅ PASS
- 질문: `전체공유 캘린더 공유대상 추가하는 방법은?`
- wait_ms: 37500 / in_tokens: 13898 / out_tokens: 2094
- 답변: 전사 공유/개별 공유 구분 + 4단계 설정 절차 + 관리자 권한 조건 명시.
- 스크린샷: `screenshots/agent-cmp-dev-tc27-02-prompt.png`, `screenshots/agent-cmp-dev-tc27-03-after.png`

## TC-28: 로그인 2단계 인증 해제 — ✅ PASS
- 질문: `로그인 2단계 인증 해제방법 알려줘`
- wait_ms: 53882 / in_tokens: 11144 / out_tokens: 1431
- 답변: 본인 직접 해제 경로(프로필>보안설정) + 관리자 필요 3가지 예외 상황(강제정책/OTP분실/전사정책변경)을 표로 구분. TC-20(OTP 취소, 관리자 관점)과 달리 본인 해제 경로 중심으로 서술되어 관점 차이가 관찰됨.
- 스크린샷: `screenshots/agent-cmp-dev-tc28-02-prompt.png`, `screenshots/agent-cmp-dev-tc28-03-after.png`

## TC-29: 조직명 변경 메뉴 (모호성 처리) — ✅ PASS
- 질문: `조직 명을 바꾸고 싶은데 어느 메뉴로 가야하지?`
- wait_ms: 50136 / in_tokens: 11322 / out_tokens: 3078
- 답변: 되묻지 않고 회사명·오피스명 / 부서명·조직도 명칭 / 발령일 지정 조직개편 3갈래를 모두 표+아코디언으로 커버. 관리자 권한 필요 안내 포함.
- 스크린샷: `screenshots/agent-cmp-dev-tc29-02-prompt.png`, `screenshots/agent-cmp-dev-tc29-03-after.png`

## TC-30: 상신한 품의서 수정 — ✅ PASS
- 질문: `품의서 올린걸 수정하고싶어`
- wait_ms: 55945 / in_tokens: 11398 / out_tokens: 2320
- 답변: 결재 상태별(진행중 단순수정/진행중 전체재작성/최종승인완료/반려) 4분기 처리 방법 표 + 기안 취소 후 기안 복사를 통한 재상신 절차 안내. 전자결재 정책 이해도 양호.
- 스크린샷: `screenshots/agent-cmp-dev-tc30-02-prompt.png`, `screenshots/agent-cmp-dev-tc30-03-after.png`

## 종합 관찰
- 10문항 모두 정상 응답·스트리밍 완료 (PASS). 무응답·오류·타임아웃(90초) 사례 없음.
- 되물음(멀티턴 유도) 사례 없음 — TC-29(모호 질문)에서도 AI가 스스로 다갈래로 커버하며 답변.
- 근거 문서·매뉴얼 출처 링크를 명시적으로 인용한 답변은 관찰되지 않음(TC-21 등에서 "매뉴얼 기반"이라 언급은 하나 하이퍼링크·문서명 인용 없음).
- **TC-22에서 응답 카드 내 표 위젯의 본문 셀이 비어 렌더링되는 이슈 관찰**(헤더만 표시, 텍스트 서술로는 동일 내용이 정상 노출). 재현 가능성 추가 확인 필요.
- wait_ms 범위: 37.5초(TC-27) ~ 63.2초(TC-24, 최장문 질의). in_tokens 범위: 10,726 ~ 54,009(TC-21, 매뉴얼 에이전트 위임으로 검색 컨텍스트 다수 로드된 것으로 추정).

## 정책 참조
- Confluence — [비교 테스트_하이웍스 매뉴얼 에이전트](https://confluence.gabia.com/spaces/AIDEVUNIT/pages/286789889)
