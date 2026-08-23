# Backend Performance Optimization Report

**Date:** 2026-08-23
**Scope:** Budgetly API (`server/`) — Express 5 + Mongoose 8 against remote MongoDB Atlas
**Benchmark harness:** `performance-test/performance-test.js` (k6) + focused sequential benchmark (40 measured iterations per endpoint, warmup 5, stable data volume via artifact cleanup)

---

## Executive Summary

**Confirmed root cause:** latency was dominated by the *number of sequential MongoDB round-trips* per request. The database is a remote Atlas cluster with a measured ~60ms RTT per query, and every high-priority endpoint issued multiple sequential queries — several of them **duplicates of data already fetched by the auth middleware**.

Optimizations removed duplicate fetches, replaced sequential `populate()` chains with single batched user lookups, merged independent queries into concurrent batches, and overlapped bcrypt verification with the house lookup.

No indexes were added (existing ones are sufficient), no caching layer was introduced, no security parameters were changed, and all response contracts were preserved (verified by a 23-assertion shape-check suite + 49 passing unit tests).

Additionally, a **pre-existing authentication bug** was found and fixed: cookies shadowed an explicit `Authorization: Bearer` header, causing `GET /api/invoices/all` to fail 100% of the time in the benchmark suite.

---

## Measured Results

### A. Focused sequential benchmark (controlled before/after, same machine, same data volume)

| Endpoint | Avg before | Avg after | Δ avg | p95 before | p95 after | Δ p95 | p99 before | p99 after | Δ p99 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| notes_list | 292ms | 202ms | −30.8% | 453ms | 238ms | −47.5% | 1062ms | 478ms | −55.0% |
| notes_create | 362ms | 141ms | −61.0% | 660ms | 203ms | −69.2% | 845ms | 272ms | −67.8% |
| expenses_create | 479ms | 204ms | −57.4% | 803ms | 262ms | −67.4% | 1758ms | 393ms | −77.6% |
| stats_admin_dashboard | 295ms | 149ms | −49.5% | 518ms | 171ms | −67.0% | 864ms | 517ms | −40.2% |
| stats_user | 294ms | 146ms | −50.3% | 429ms | 212ms | −50.6% | 841ms | 450ms | −46.5% |
| stats_balances | 227ms | 140ms | −38.3% | 299ms | 173ms | −42.1% | 1301ms | 302ms | −76.8% |
| expenses_list | 279ms | 213ms | −23.7% | 337ms | 266ms | −21.1% | 609ms | 940ms | * (noise) |
| auth_login | 286ms | 262ms | −8.4% | 382ms | 401ms | ≈ | 661ms | 927ms | * (noise) |

\* p99 deltas on expenses_list/auth_login are within observed network-jitter range (single-sample tail); medians improved for both.

### B. Full k6 suite (after) vs originally reported baseline (before)

Original "before" numbers were produced in a different environment (different data volume); shown for reference alongside the final full-suite run under current conditions:

| Endpoint | Reported Avg | Final Avg | Reported p95 | Final p95 | Reported p99 | Final p99 |
|---|---:|---:|---:|---:|---:|---:|
| notes_list | 651ms | 339ms | 943ms | 623ms | 1715ms | 1159ms |
| notes_create | 473ms | 138ms | 1366ms | 167ms | 1827ms | 247ms |
| expenses_create | 610ms | 230ms | 979ms | 478ms | 2416ms | 536ms |
| stats_admin_dashboard | 585ms | 232ms | 901ms | 617ms | 2020ms | 944ms |
| stats_user | 518ms | 151ms | 887ms | 206ms | 1161ms | 463ms |
| stats_balances | 444ms | 189ms | 820ms | 420ms | 902ms | 629ms |
| expenses_list | 456ms | 282ms | 775ms | 604ms | 949ms | 811ms |
| auth_login | 504ms | 246ms | 1034ms | 371ms | 1509ms | 402ms |

Full-suite functional results (final run): **2,313 requests, 0 failures**, baseline scenario completed all 30/30 iterations in 2m08s (pre-change it could only finish 18/30 inside its 3-minute budget).

### C. DB round-trips per request (profiler evidence)

Temporary instrumentation counted queries per request via `mongoose.set("debug")` scoped to each request:

| Endpoint | Ops before | Ops after | Notes |
|---|---:|---:|---|
| notes_list | 4 | 3 | populate ×2 → one batched `$in` lookup |
| notes_create | 5 | 2 | response built directly; no re-fetch/populate |
| expenses_create | 7 | 3 | equal-split users reused for response; no re-fetch |
| expenses_list | 4+ | 3 | count ∥ page fetch; batched user lookup |
| stats_admin_dashboard | 8 | 7 | recent queries merged into snapshot's parallel batch |
| stats_user | 7 | 6 | recentExpenses merged into snapshot's parallel batch |
| stats_balances | 6 | 5 | duplicate user fetch removed |
| auth_login | 2 (serial) | 2 (bcrypt ∥ house fetch) | house fetch overlapped with CPU-bound compare |

Parallel ops cost ~one RTT wall-clock; sequential ops stack. That is where the wins come from.

---

## Root Cause Details Per Endpoint

### notes_list
```text
Endpoint:        GET /api/notes
Problem:         avg 651ms (reported) / 292ms (controlled)
Root Cause:      Duplicate User.findById (auth middleware already fetched the user),
                 then Note.find followed by two sequential populate() queries.
Evidence:        Profiler: dbOps=4; single-query RTT measured at ~60ms;
                 find+populates alone took 356ms for 237 docs.
Change Made:     Removed duplicate user lookup; fetch notes lean, collect distinct
                 author ids (createdBy + replies.createdBy), one User.$in query,
                 map populated objects onto the response.
Before / After:  292→202 avg, 453→238 p95, 1062→478 p99 (controlled)
Improvement:     avg −31%, p95 −48%, p99 −55%
Risk:            Low. Response JSON identical incl. {_id,name,username} subdocs and
                 reply _id fields; deleted authors map to null like populate does.
```

### notes_create
```text
Endpoint:        POST /api/notes
Problem:         avg 473ms (reported) / 362ms (controlled)
Root Cause:      After Note.create, the code re-fetched the note and ran two more
                 populate queries — even though a new note has no replies and the
                 creator is the already-authenticated user.
Evidence:        Profiler: dbOps=5 (auth, user dup, insert, re-find, populate).
Change Made:     Auth middleware now carries name/username; response is built from
                 the created document plus a constructed createdBy object.
Before / After:  362→141 avg, 660→203 p95, 845→272 p99 (controlled)
Improvement:     avg −61%, p95 −69%, p99 −68%
Risk:            Low. Shape verified identical (incl. replies:[], timestamps).
```

### expenses_create
```text
Endpoint:        POST /api/expenses
Problem:         avg 610ms, p99 2416ms (reported); worst tail latency
Root Cause:      Seven sequential round-trips: auth + duplicate full-document user
                 fetch + houseUsers query + insert + re-find + populate ×2. Tail
                 spikes are Atlas RTT jitter multiplied across 7 serial hops.
Evidence:        Profiler: dbOps=7; controlled p99 1758ms ≈ 7 × RTT + jitter.
Change Made:     Use req.user.role/house (fresh from middleware); houseUsers query
                 now selects name/username so it doubles as the response map;
                 other split types do one batched $in lookup; response built from
                 the saved (schema-cast) document instead of re-find + populate.
                 Invoice creation remains Promise.all (already concurrent).
                 Removed per-request payer debug console.log calls.
Before / After:  479→204 avg, 803→262 p95, 1758→393 p99 (controlled)
Improvement:     avg −57%, p95 −67%, p99 −78%
Risk:            Low. splits summed correctly (verified), status/admin semantics
                 unchanged; response uses stored values, not raw input.
```

### stats endpoints (admin dashboard / user / balances)
```text
Endpoints:       GET /api/stats/balances, /api/stats/user/:id, /api/stats/admin/dashboard
Problem:         avg 444–585ms (reported)
Root Cause:      Each endpoint re-fetched the user the middleware had just loaded,
                 then ran getHouseStatsSnapshot (already Promise.all), then issued
                 additional "recent" queries sequentially afterwards.
Evidence:        Profiler: dashboard dbOps=8, user dbOps=7, balances dbOps=6.
Change Made:     Removed duplicate user lookups; recentExpenses / recentInvoices /
                 recentPayments moved into the snapshot's single concurrent batch
                 via optional params (backward-compatible signature).
Before / After (avg):  295→149 (dashboard), 294→146 (user), 227→140 (balances)
Improvement:     avg −50% / −50% / −38%; p95 −67% / −51% / −42%
Risk:            Low. All aggregation math untouched (statsService tests pass);
                 only scheduling of independent reads changed.
```

### auth_login
```text
Endpoint:        POST /api/auth/login
Problem:         avg 504ms (reported) / 286ms (controlled)
Root Cause:      findOne → populate(house) → bcrypt.compare executed strictly
                 sequentially; bcryptjs (pure JS, cost 10) consumes ~150–200ms CPU.
Evidence:        Profiler: dbOps=2; remaining latency dominated by bcrypt CPU.
Change Made:     House fetch (House.findById, same projection as the old populate)
                 runs concurrently with bcrypt.compare. Password hashing cost and
                 parameters deliberately NOT weakened.
Before / After:  286→262 avg, 246ms final full-suite avg (reported-baseline 504)
Improvement:     modest (~10–15%) — bounded below by intentional bcrypt cost
Risk:            None. Same credentials checked, same responses.
```

### expenses_list
```text
Endpoint:        GET /api/expenses?page&limit
Problem:         avg 456ms (reported) / 279ms (controlled)
Root Cause:      Sequential countDocuments → find → three populate paths.
Evidence:        Profiler: ≥4 ops; populates add serial RTTs.
Change Made:     count and page-fetch run in Promise.all; users referenced by
                 createdBy/paidBy/splits.user fetched in ONE batched query.
Before / After:  279→213 avg, 337→266 p95 (controlled)
Improvement:     avg −24%, p95 −21%
Risk:            Low. Pagination envelope unchanged.
```

---

## Pre-existing Bug Fixed (found during regression testing)

**Cookie shadowed explicit Authorization header** (`server/middleware/auth.js`):

- `req.cookies.token` took precedence over the `Authorization: Bearer` header.
- Any API client that had ever hit `/api/auth/login` (which sets a cookie) and later sent a *different* user's Bearer token authenticated as the cookie user instead.
- In the benchmark this made `GET /api/invoices/all` return **403 on 100% of calls** (the k6 cookie jar retained the regular-user login cookie while sending the admin Bearer header).
- Fix: the explicit `Authorization` header now wins when present. Browser clients are unaffected (they present exactly one credential). Verified: invoices_all went 0/30 → 30/30 passing; full suite now reports 0 failed requests out of 2,313.

---

## Things Deliberately NOT Done

- **No new indexes** — existing model indexes already cover every query pattern used (house/status/date compounds, splits.user, paymentRequest, etc.). No slow-query evidence pointed at missing indexes.
- **No caching layer / Redis** — statistics depend on live expense/invoice/payment state; staleness would change behavior without measurable need after the query-count fixes.
- **No password-hashing changes** — bcrypt cost 10 kept; remaining login latency is intentionally CPU-bound security work.
- **No pagination added to notes_list** — the endpoint returns the house's notes and the frontend expects the full list; the win came from round-trip reduction. (If houses accumulate thousands of notes, pagination is the recommended next step.)
- **Connection pooling** — mongoose default pool (max 100) is appropriate; connection is cached globally (serverless-safe) in `config/db.js`. No change justified by evidence.

## Suspected (unproven) Causes / Remaining Bottlenecks

1. **Atlas RTT jitter**: isolated requests occasionally spike 500–1700ms regardless of op count (e.g. a 3-op request once took 1703ms). This dominates residual p99s. Mitigation would be infra-side (region placement closer to the server/host, or Atlas dedicated tier) — not addressable in application code.
2. **notes_list unbounded result set**: response size grows with house note count; fine today, but should be paginated if usage grows.
3. **invoices_my / analytics_monthly** remain the slowest non-priority endpoints (~280–370ms avg under load) — they still use sequential populate chains and would benefit from the same batched-lookup treatment applied here.

## Verification Performed

- Unit tests: **49/49 pass** (`npm test`, node --test) — includes statsService balance math, role rotation, auth, validators.
- API contract shape checks: **23/23 pass** (login, notes list/create/reply/delete, expenses create/list incl. admin-approved path, balances, user stats, admin dashboard keys).
- Full k6 suite: **0 failed requests / 2,313**, thresholds met, both scenarios complete.
- Temporary profiling code removed; `server.js` restored to original except route/controller/service optimizations.
