// 대시보드 버전 매니페스트 — RUN 종료 시 메인 Claude 가 갱신 (source of truth)
// 버전 1개 = 완료된 RUN 1개. 스냅샷 본체는 versions/vN.js (window.QA_DATA, data.js 와 동일 스키마).
// dashboard.html 이 이 파일을 읽어 버전 선택기를 그리고, 선택 시 해당 versions/vN.js 를 로드한다.
window.QA_VERSIONS = {
  current: null,   // 최신 버전 id. 예: "v2"
  list: [
    // 최신이 위로. 예:
    // { v: "v2", run_id: "RUN-20260603-1010-dev", env: "dev", date: "2026-06-03", file: "versions/v2.js" },
    // { v: "v1", run_id: "RUN-20260602-1430-dev", env: "dev", date: "2026-06-02", file: "versions/v1.js" },
  ],
};
