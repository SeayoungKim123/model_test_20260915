# 매뉴얼 에이전트 비교 — Q11~Q20 (GPT 5.6 Terra) — 실행 결과

**RUN-ID**: RUN-20260907-1622-prd
**환경**: prd (매뉴얼 에이전트 X)
**계정**: 일반 사용자2 (hakyoung@hiworks04.pe.kr)
**모델**: GPT 5.6 Terra
**시간**: 16:31:43 ~ 16:43:40 (약 12m)
**결과**: ✅ 10 Pass / ❌ 0 Fail (판정 기준: 응답 성립 여부만)

## 사용자 흐름

Q11~Q20 열 문항을 각각 새 대화로 시작해 GPT 5.6 Terra 모델로 질문을 전송하고, 응답 완료까지의 체감 대기(wait_ms)와 답변 전문을 캡처했다. 직접 조작·검색 없이 채팅창 전송만 수행했으며, 멀티턴 없이 1문항 = 1턴으로 종료했다. prd 환경에는 매뉴얼/에이전트 관련 토글이 화면에 노출되지 않아 기본 상태 그대로 진행했다.

## TC-11: 메인 화면 위젯형 복원 — ✅ PASS
- 질문: `하이웍스 메인을 위젯형으로 다시 되돌리고 싶어`
- wait_ms: 32184
- 답변 요지: 화면 편집 메뉴에서 위젯형 선택 후 저장하는 3단계 경로 제시. 관리자 정책으로 편집 권한이 제한될 수 있음을 언급.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc11-02-prompt.png`, `screenshots/agent-cmp-prd-tc11-03-after.png`

## TC-12: 비밀번호 변경 방법 (초단문 질의) — ✅ PASS
- 질문: `비번변경방법`
- wait_ms: 18930
- 답변 요지: 조사 없는 초단문을 즉시 이해해 되묻지 않고 바로 프로필 > 내 정보 관리 경로 안내. SSO/외부 계정 연동 시 예외만 언급, 개인/메일 비밀번호 구분 안내는 없음.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc12-02-prompt.png`, `screenshots/agent-cmp-prd-tc12-03-after.png`

## TC-13: 메일 수신 불가 원인 — ✅ PASS
- 질문: `왜 메일수신이 안되지?`
- wait_ms: 35083
- 답변 요지: 실제 받은편지함·스팸함을 조회(7단계)한 뒤 발신 미발송·주소 오입력·도메인 설정 등 원인 후보를 제시하고 관리자 문의를 권고.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc13-02-prompt.png`, `screenshots/agent-cmp-prd-tc13-03-after.png`

## TC-14: 휴가 신청 위치 (초단문 질의) — ✅ PASS
- 질문: `휴가신청 어디서하나`
- wait_ms: 17686
- 답변 요지: 조사 생략 구어체를 정확히 이해해 전자결재 → 기안하기 → 휴가신청서 경로를 간결하게 안내.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc14-02-prompt.png`, `screenshots/agent-cmp-prd-tc14-03-after.png`

## TC-15: AI 기능 자체에 대한 메타 질문 — ✅ PASS
- 질문: `이 AI가 도와주는 게 뭐야? 뭘 물어보면 되는걸까`
- wait_ms: 29307
- 답변 요지: 메일·쪽지, 일정·회의실 예약, 업무·전자결재, 조직·휴가, 사내 자료·게시판·드라이브, 문서·표·이미지 생성 등 기능 카테고리별 예시 질문을 제시. **매뉴얼 에이전트로서의 정체성은 언급하지 않음** — dev(에이전트 O) 대비 결과 차이가 예상되는 핵심 관찰 포인트.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc15-02-prompt.png`, `screenshots/agent-cmp-prd-tc15-03-after.png`(상단), `screenshots/agent-cmp-prd-tc15-03b-after.png`(하단, 답변이 1화면을 넘어 다장 캡처)

## TC-16: 대체휴무 등록 방법 — ✅ PASS
- 질문: `하이웍스에서 대체휴무 올리려면 어떻게 해야해?`
- wait_ms: 33727
- 답변 요지: 전자결재 휴가신청서에서 대체휴무/보상휴가를 선택하는 경로 안내, 대체휴무 항목·잔여일수가 안 보이면 관리자의 사전 설정이 필요할 수 있음을 언급.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc16-02-prompt.png`, `screenshots/agent-cmp-prd-tc16-03-after.png`

## TC-17: 다크모드 설정 (초단문 질의) — ✅ PASS
- 질문: `다크모드 설정 어떻게해`
- wait_ms: 42821
- 답변 요지: 서비스별(주소록·게시판 등)로 다크모드를 개별 설정할 수 있다고 안내. **미지원 기능을 지어냈을 가능성(환각) 의심** — 게시판 어두운 테마 지원 여부는 별도 확인 필요.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc17-02-prompt.png`, `screenshots/agent-cmp-prd-tc17-03-after.png`

## TC-18: 휴가 결재 처리 기본값 설정 — ✅ PASS
- 질문: `휴가 결재 처리부분에 기본값 설정하는법,.`
- wait_ms: 31054
- 답변 요지: 오타·잘린 문장(`,.`)에도 의도를 정확히 파악. 개인별 기본 결재선 저장 방법과 관리자 권한이 필요한 회사 공통 기본값(양식 관리) 설정 방법을 구분해 안내.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc18-02-prompt.png`, `screenshots/agent-cmp-prd-tc18-03-after.png`

## TC-19: 메일함 비밀번호 재설정 (명사 나열형 질의) — ✅ PASS
- 질문: `메일함 비밀번호 재설정`
- wait_ms: 38801
- 답변 요지: 명사 나열형 질의를 요청으로 정확히 해석. 메일함 비밀번호가 계정 비밀번호와 동일함을 안내하고, 본인 인증 불가 시 관리자 초기화 요청 경로도 포함.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc19-02-prompt.png`, `screenshots/agent-cmp-prd-tc19-03-after.png`

## TC-20: 보안 OTP 사용 취소 — ✅ PASS
- 질문: `보안 otp사용취소하고싶은데 어떻게 설정해야해?`
- wait_ms: 32610
- 답변 요지: 본인이 직접 해제하는 4단계 경로(내 정보 > 설정 > 보안 설정 > 2단계 인증)와, OTP 앱 분실 시 관리자·고객센터 경유 해제 경로를 명확히 구분. 보안 기능 특성상 신중한 안내 톤 유지.
- 근거 문서 인용: 없음 / 되물음: 없음
- 스크린샷: `screenshots/agent-cmp-prd-tc20-02-prompt.png`, `screenshots/agent-cmp-prd-tc20-03-after.png`

## 관찰 요약

- 10개 TC 모두 정상 응답·스트리밍 완료로 PASS. prd(에이전트 X) 환경에서는 화면에 매뉴얼/에이전트 관련 토글이 노출되지 않았고, TC-15(메타 질문)에서도 매뉴얼 에이전트 정체성 언급이 없어 dev(에이전트 O) 결과와의 비교 축이 뚜렷하게 성립할 것으로 보인다.
- 모든 TC에서 근거 문서·매뉴얼 출처 인용 없이 일반 안내 형태로 답변. TC-17(다크모드)은 미지원 기능을 단정적으로 안내해 환각 가능성이 있어 사람 검토가 필요.
- wait_ms 범위: 17.7초(TC-14) ~ 42.8초(TC-17). in_tokens/out_tokens는 AI채팅 UI에 표시되지 않아 전 TC `null`.

## 정책 참조
- Confluence — [비교 테스트_하이웍스 매뉴얼 에이전트](https://confluence.gabia.com/spaces/AIDEVUNIT/pages/286789889)
