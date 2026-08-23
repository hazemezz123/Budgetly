import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";
const TEST_ADMIN_USERNAME = __ENV.TEST_ADMIN_USERNAME || "perf_test_admin";
const TEST_ADMIN_PASSWORD = __ENV.TEST_ADMIN_PASSWORD || "password123";
const TEST_USER_USERNAME = __ENV.TEST_USER_USERNAME || "perf_test_user";
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || "password123";

const endpointMetrics = {
  "GET /": { trend: new Trend("latency_root"), err: new Counter("errors_root") },
  "GET /api/health": { trend: new Trend("latency_api_health"), err: new Counter("errors_api_health") },
  "POST /api/auth/login": { trend: new Trend("latency_auth_login"), err: new Counter("errors_auth_login") },
  "GET /api/auth/me": { trend: new Trend("latency_auth_me"), err: new Counter("errors_auth_me") },
  "GET /api/houses": { trend: new Trend("latency_houses_list"), err: new Counter("errors_houses_list") },
  "GET /api/houses/:id": { trend: new Trend("latency_houses_get_by_id"), err: new Counter("errors_houses_get_by_id") },
  "GET /api/houses/:id/rotation": { trend: new Trend("latency_houses_rotation"), err: new Counter("errors_houses_rotation") },
  "GET /api/users": { trend: new Trend("latency_users_list"), err: new Counter("errors_users_list") },
  "GET /api/users/:id": { trend: new Trend("latency_users_get_by_id"), err: new Counter("errors_users_get_by_id") },
  "GET /api/expenses": { trend: new Trend("latency_expenses_list"), err: new Counter("errors_expenses_list") },
  "GET /api/invoices/my-invoices": { trend: new Trend("latency_invoices_my"), err: new Counter("errors_invoices_my") },
  "GET /api/invoices/all": { trend: new Trend("latency_invoices_all"), err: new Counter("errors_invoices_all") },
  "GET /api/notes": { trend: new Trend("latency_notes_list"), err: new Counter("errors_notes_list") },
  "GET /api/stats/balances": { trend: new Trend("latency_stats_balances"), err: new Counter("errors_stats_balances") },
  "GET /api/stats/user/:userId": { trend: new Trend("latency_stats_user"), err: new Counter("errors_stats_user") },
  "GET /api/stats/admin/dashboard": { trend: new Trend("latency_stats_admin_dashboard"), err: new Counter("errors_stats_admin_dashboard") },
  "GET /api/analytics/monthly": { trend: new Trend("latency_analytics_monthly"), err: new Counter("errors_analytics_monthly") },
  "GET /api/analytics/trends": { trend: new Trend("latency_analytics_trends"), err: new Counter("errors_analytics_trends") },
  "POST /api/expenses": { trend: new Trend("latency_expenses_create"), err: new Counter("errors_expenses_create") },
  "POST /api/notes": { trend: new Trend("latency_notes_create"), err: new Counter("errors_notes_create") },
  "POST /api/notes/:id/reply": { trend: new Trend("latency_notes_reply"), err: new Counter("errors_notes_reply") },
};

export const options = {
  summaryTrendStats: ["min", "med", "avg", "p(75)", "p(90)", "p(95)", "p(99)", "max", "count"],
  scenarios: {
    baseline_endpoints: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 30,
      maxDuration: "3m",
      exec: "testBaseline",
    },
    moderate_load: {
      executor: "ramping-vus",
      startTime: "1m30s",
      startVUs: 1,
      stages: [
        { duration: "20s", target: 5 },
        { duration: "40s", target: 10 },
        { duration: "20s", target: 0 },
      ],
      exec: "testModerateLoad",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export function setup() {
  const loginPayload = JSON.stringify({
    username: TEST_ADMIN_USERNAME,
    password: TEST_ADMIN_PASSWORD,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-benchmark": "budgetly-audit",
    },
  };

  const adminRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, params);
  check(adminRes, { "Admin setup login successful": (r) => r.status === 200 });

  const adminData = adminRes.json();
  const adminToken = adminData.token;
  const adminUser = adminData.user;
  const houseId = adminUser.house?._id || adminUser.house;

  const userLoginPayload = JSON.stringify({
    username: TEST_USER_USERNAME,
    password: TEST_USER_PASSWORD,
  });

  const userRes = http.post(`${BASE_URL}/api/auth/login`, userLoginPayload, params);
  check(userRes, { "Regular user setup login successful": (r) => r.status === 200 });
  const userData = userRes.json();
  const userToken = userData.token;
  const regularUser = userData.user;

  // Create an initial note for reply testing
  const noteRes = http.post(
    `${BASE_URL}/api/notes`,
    JSON.stringify({ content: "Initial performance benchmark note" }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        "x-benchmark": "budgetly-audit",
      },
    }
  );
  let noteId = null;
  if (noteRes.status === 201) {
    const noteData = noteRes.json();
    noteId = noteData._id;
  }

  return {
    adminToken,
    userToken,
    adminId: adminUser.id || adminUser._id,
    userId: regularUser.id || regularUser._id,
    houseId: typeof houseId === "object" ? houseId._id : houseId,
    noteId,
  };
}

function runEndpoint(name, reqFn, expectedStatus = 200) {
  const res = reqFn();
  const isErr = res.status < 200 || res.status >= 400;

  if (endpointMetrics[name]) {
    endpointMetrics[name].trend.add(res.timings.duration);
    endpointMetrics[name].err.add(isErr ? 1 : 0);
  }
  return res;
}

export function testBaseline(data) {
  const adminHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.adminToken}`,
    "x-benchmark": "budgetly-audit",
  };

  const userHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.userToken}`,
    "x-benchmark": "budgetly-audit",
  };

  const publicHeaders = {
    "x-benchmark": "budgetly-audit",
  };

  // 1. GET /
  runEndpoint("GET /", () => http.get(`${BASE_URL}/`, { headers: publicHeaders }), 200);
  sleep(0.02);

  // 2. GET /api/health
  runEndpoint("GET /api/health", () => http.get(`${BASE_URL}/api/health`, { headers: publicHeaders }), 200);
  sleep(0.02);

  // 3. POST /api/auth/login
  runEndpoint(
    "POST /api/auth/login",
    () =>
      http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({
          username: TEST_USER_USERNAME,
          password: TEST_USER_PASSWORD,
        }),
        { headers: { "Content-Type": "application/json", "x-benchmark": "budgetly-audit" } }
      ),
    200
  );
  sleep(0.02);

  // 4. GET /api/auth/me
  runEndpoint("GET /api/auth/me", () =>
    http.get(`${BASE_URL}/api/auth/me`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 5. GET /api/houses
  runEndpoint("GET /api/houses", () => http.get(`${BASE_URL}/api/houses`, { headers: publicHeaders }), 200);
  sleep(0.02);

  // 6. GET /api/houses/:id
  if (data.houseId) {
    runEndpoint("GET /api/houses/:id", () =>
      http.get(`${BASE_URL}/api/houses/${data.houseId}`, { headers: userHeaders }), 200
    );
    sleep(0.02);

    // 7. GET /api/houses/:id/rotation
    runEndpoint("GET /api/houses/:id/rotation", () =>
      http.get(`${BASE_URL}/api/houses/${data.houseId}/rotation`, {
        headers: adminHeaders,
      }), 200
    );
    sleep(0.02);
  }

  // 8. GET /api/users
  runEndpoint("GET /api/users", () =>
    http.get(`${BASE_URL}/api/users`, { headers: adminHeaders }), 200
  );
  sleep(0.02);

  // 9. GET /api/users/:id
  runEndpoint("GET /api/users/:id", () =>
    http.get(`${BASE_URL}/api/users/${data.userId}`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 10. GET /api/expenses
  runEndpoint("GET /api/expenses", () =>
    http.get(`${BASE_URL}/api/expenses?page=1&limit=10`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 11. GET /api/invoices/my-invoices
  runEndpoint("GET /api/invoices/my-invoices", () =>
    http.get(`${BASE_URL}/api/invoices/my-invoices`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 12. GET /api/invoices/all
  runEndpoint("GET /api/invoices/all", () =>
    http.get(`${BASE_URL}/api/invoices/all`, {
      headers: {
        Authorization: `Bearer ${data.adminToken}`,
        "Content-Type": "application/json",
        "x-benchmark": "budgetly-audit",
      },
    }), 200
  );
  sleep(0.02);

  // 13. GET /api/notes
  runEndpoint("GET /api/notes", () =>
    http.get(`${BASE_URL}/api/notes`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 14. GET /api/stats/balances
  runEndpoint("GET /api/stats/balances", () =>
    http.get(`${BASE_URL}/api/stats/balances`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 15. GET /api/stats/user/:userId
  runEndpoint("GET /api/stats/user/:userId", () =>
    http.get(`${BASE_URL}/api/stats/user/${data.userId}`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 16. GET /api/stats/admin/dashboard
  runEndpoint("GET /api/stats/admin/dashboard", () =>
    http.get(`${BASE_URL}/api/stats/admin/dashboard`, { headers: adminHeaders }), 200
  );
  sleep(0.02);

  // 17. GET /api/analytics/monthly
  runEndpoint("GET /api/analytics/monthly", () =>
    http.get(`${BASE_URL}/api/analytics/monthly`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 18. GET /api/analytics/trends
  runEndpoint("GET /api/analytics/trends", () =>
    http.get(`${BASE_URL}/api/analytics/trends?months=6`, { headers: userHeaders }), 200
  );
  sleep(0.02);

  // 19. POST /api/expenses
  runEndpoint(
    "POST /api/expenses",
    () =>
      http.post(
        `${BASE_URL}/api/expenses`,
        JSON.stringify({
          title: "Benchmark Expense Item",
          category: "Groceries",
          totalAmount: 50,
          splitType: "equal",
        }),
        { headers: userHeaders }
      ),
    201
  );
  sleep(0.02);

  // 20. POST /api/notes
  const noteCreationRes = runEndpoint(
    "POST /api/notes",
    () =>
      http.post(
        `${BASE_URL}/api/notes`,
        JSON.stringify({ content: "Benchmark Note Message" }),
        { headers: userHeaders }
      ),
    201
  );
  sleep(0.02);

  let activeNoteId = data.noteId;
  if (noteCreationRes.status === 201) {
    const resBody = noteCreationRes.json();
    if (resBody && resBody._id) {
      activeNoteId = resBody._id;
    }
  }

  // 21. POST /api/notes/:id/reply
  if (activeNoteId) {
    runEndpoint(
      "POST /api/notes/:id/reply",
      () =>
        http.post(
          `${BASE_URL}/api/notes/${activeNoteId}/reply`,
          JSON.stringify({ content: "Benchmark Note Reply" }),
          { headers: userHeaders }
        ),
      200
    );
    sleep(0.02);
  }
}

export function testModerateLoad(data) {
  const adminHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.adminToken}`,
    "x-benchmark": "budgetly-audit",
  };

  const userHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.userToken}`,
    "x-benchmark": "budgetly-audit",
  };

  const publicHeaders = {
    "x-benchmark": "budgetly-audit",
  };

  runEndpoint("GET /api/health", () => http.get(`${BASE_URL}/api/health`, { headers: publicHeaders }), 200);
  runEndpoint("GET /api/auth/me", () =>
    http.get(`${BASE_URL}/api/auth/me`, { headers: userHeaders }), 200
  );
  runEndpoint("GET /api/expenses", () =>
    http.get(`${BASE_URL}/api/expenses?page=1&limit=10`, { headers: userHeaders }), 200
  );
  runEndpoint("GET /api/stats/balances", () =>
    http.get(`${BASE_URL}/api/stats/balances`, { headers: userHeaders }), 200
  );
  runEndpoint("GET /api/stats/admin/dashboard", () =>
    http.get(`${BASE_URL}/api/stats/admin/dashboard`, { headers: adminHeaders }), 200
  );
  runEndpoint("GET /api/analytics/monthly", () =>
    http.get(`${BASE_URL}/api/analytics/monthly`, { headers: userHeaders }), 200
  );
  runEndpoint("GET /api/notes", () =>
    http.get(`${BASE_URL}/api/notes`, { headers: userHeaders }), 200
  );
  runEndpoint("GET /api/invoices/my-invoices", () =>
    http.get(`${BASE_URL}/api/invoices/my-invoices`, { headers: userHeaders }), 200
  );

  sleep(0.1);
}

export function handleSummary(data) {
  return {
    "performance-test/performance-results/raw-results.json": JSON.stringify(data, null, 2),
  };
}
