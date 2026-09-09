// 대시보드 버전 매니페스트 — RUN 종료 시 메인 Claude 가 갱신 (source of truth)
// 버전 1개 = 완료된 RUN 1개. 스냅샷 본체는 versions/vN.js (window.QA_DATA, data.js 와 동일 스키마).
// dashboard.html 이 이 파일을 읽어 버전 선택기를 그리고, 선택 시 해당 versions/vN.js 를 로드한다.
window.QA_VERSIONS = {
  current: "v9",
  list: [
    { v: "v9", run_id: "RUN-20260908-1821-prd", env: "prd", date: "2026-09-08", file: "versions/v9.js" },
    { v: "v8", run_id: "RUN-20260908-1821-dev", env: "dev", date: "2026-09-08", file: "versions/v8.js" },
    { v: "v7", run_id: "RUN-20260908-1752-dev", env: "dev", date: "2026-09-08", file: "versions/v7.js" },
    { v: "v6", run_id: "RUN-20260908-1304-prd", env: "prd", date: "2026-09-08", file: "versions/v6.js" },
    { v: "v5", run_id: "RUN-20260908-1304-dev", env: "dev", date: "2026-09-08", file: "versions/v5.js" },
    { v: "v4", run_id: "RUN-20260908-1156-prd", env: "prd", date: "2026-09-08", file: "versions/v4.js" },
    { v: "v3", run_id: "RUN-20260908-1156-dev", env: "dev", date: "2026-09-08", file: "versions/v3.js" },
    { v: "v2", run_id: "RUN-20260907-1622-prd", env: "prd", date: "2026-09-07", file: "versions/v2.js" },
    { v: "v1", run_id: "RUN-20260907-1622-dev", env: "dev", date: "2026-09-07", file: "versions/v1.js" },
  ],
};
