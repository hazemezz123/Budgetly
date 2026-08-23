import fs from "fs";

const raw = JSON.parse(fs.readFileSync("./performance-test/performance-results/raw-results.json", "utf8"));

const mapping = [
  { method: "GET", endpoint: "/", auth: "Public", metric: "latency_root", errMetric: "errors_root" },
  { method: "GET", endpoint: "/api/health", auth: "Public", metric: "latency_api_health", errMetric: "errors_api_health" },
  { method: "POST", endpoint: "/api/auth/login", auth: "Public", metric: "latency_auth_login", errMetric: "errors_auth_login" },
  { method: "GET", endpoint: "/api/auth/me", auth: "Bearer Token", metric: "latency_auth_me", errMetric: "errors_auth_me" },
  { method: "GET", endpoint: "/api/houses", auth: "Public", metric: "latency_houses_list", errMetric: "errors_houses_list" },
  { method: "GET", endpoint: "/api/houses/:id", auth: "Bearer Token", metric: "latency_houses_get_by_id", errMetric: "errors_houses_get_by_id" },
  { method: "GET", endpoint: "/api/houses/:id/rotation", auth: "Bearer Token (Admin)", metric: "latency_houses_rotation", errMetric: "errors_houses_rotation" },
  { method: "GET", endpoint: "/api/users", auth: "Bearer Token", metric: "latency_users_list", errMetric: "errors_users_list" },
  { method: "GET", endpoint: "/api/users/:id", auth: "Bearer Token", metric: "latency_users_get_by_id", errMetric: "errors_users_get_by_id" },
  { method: "GET", endpoint: "/api/expenses", auth: "Bearer Token", metric: "latency_expenses_list", errMetric: "errors_expenses_list" },
  { method: "GET", endpoint: "/api/invoices/my-invoices", auth: "Bearer Token", metric: "latency_invoices_my", errMetric: "errors_invoices_my" },
  { method: "GET", endpoint: "/api/invoices/all", auth: "Bearer Token (Admin)", metric: "latency_invoices_all", errMetric: "errors_invoices_all" },
  { method: "GET", endpoint: "/api/notes", auth: "Bearer Token", metric: "latency_notes_list", errMetric: "errors_notes_list" },
  { method: "GET", endpoint: "/api/stats/balances", auth: "Bearer Token", metric: "latency_stats_balances", errMetric: "errors_stats_balances" },
  { method: "GET", endpoint: "/api/stats/user/:userId", auth: "Bearer Token", metric: "latency_stats_user", errMetric: "errors_stats_user" },
  { method: "GET", endpoint: "/api/stats/admin/dashboard", auth: "Bearer Token (Admin)", metric: "latency_stats_admin_dashboard", errMetric: "errors_stats_admin_dashboard" },
  { method: "GET", endpoint: "/api/analytics/monthly", auth: "Bearer Token", metric: "latency_analytics_monthly", errMetric: "errors_analytics_monthly" },
  { method: "GET", endpoint: "/api/analytics/trends", auth: "Bearer Token", metric: "latency_analytics_trends", errMetric: "errors_analytics_trends" },
  { method: "POST", endpoint: "/api/expenses", auth: "Bearer Token", metric: "latency_expenses_create", errMetric: "errors_expenses_create" },
  { method: "POST", endpoint: "/api/notes", auth: "Bearer Token", metric: "latency_notes_create", errMetric: "errors_notes_create" },
  { method: "POST", endpoint: "/api/notes/:id/reply", auth: "Bearer Token", metric: "latency_notes_reply", errMetric: "errors_notes_reply" },
];

function getRating(p95) {
  if (p95 < 200) return "Excellent";
  if (p95 < 500) return "Good";
  if (p95 < 1000) return "Acceptable";
  if (p95 < 2000) return "Slow";
  return "Critical";
}

const rows = mapping.map((m) => {
  const metric = raw.metrics[m.metric]?.values || {};
  const errCount = raw.metrics[m.errMetric]?.values?.count || 0;
  const p95 = metric["p(95)"] || 0;
  return {
    method: m.method,
    endpoint: m.endpoint,
    auth: m.auth,
    requests: metric.count || 0,
    errors: errCount,
    avg: (metric.avg || 0).toFixed(2),
    p50: (metric.med || 0).toFixed(2),
    p75: (metric["p(75)"] || 0).toFixed(2),
    p90: (metric["p(90)"] || 0).toFixed(2),
    p95: p95.toFixed(2),
    p95Num: p95,
    p99: (metric["p(99)"] || 0).toFixed(2),
    max: (metric.max || 0).toFixed(2),
    rating: getRating(p95),
  };
});

rows.sort((a, b) => b.p95Num - a.p95Num);

console.log("| Method | Endpoint | Auth | Requests | Errors | Avg | p50 | p75 | p90 | p95 | p99 | Max | Rating |");
console.log("| ------ | -------- | ---- | -------: | -----: | --: | --: | --: | --: | --: | --: | --: | ------ |");
rows.forEach((r) => {
  console.log(
    `| ${r.method} | \`${r.endpoint}\` | ${r.auth} | ${r.requests} | ${r.errors} | ${r.avg} ms | ${r.p50} ms | ${r.p75} ms | ${r.p90} ms | ${r.p95} ms | ${r.p99} ms | ${r.max} ms | ${r.rating} |`
  );
});

const ratingsCount = { Excellent: 0, Good: 0, Acceptable: 0, Slow: 0, Critical: 0 };
rows.forEach((r) => ratingsCount[r.rating]++);
console.log("\nRatings Count:", ratingsCount);
console.log("Total Tested Endpoints:", rows.length);
console.log("Overall Avg:", raw.metrics.http_req_duration.values.avg.toFixed(2));
console.log("Overall p95:", raw.metrics.http_req_duration.values["p(95)"].toFixed(2));
console.log("Overall p99:", raw.metrics.http_req_duration.values["p(99)"]?.toFixed(2) || "N/A");
