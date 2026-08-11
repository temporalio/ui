# Sort sandbox — scale measurements

POC harnesses behind the sort sandbox drawer. They answer one question: is the
10,000-row cap on the Workflows list a real constraint or an inherited one?

**Short answer: neither sorting nor bandwidth is the constraint. The namespace
RPS quota is.** Everything below is measured, not estimated.

## Findings

### Sorting 12M rows client-side is not a problem

`bench-columnar.mjs` — columnar typed arrays, radix/counting sort over an index
permutation, 12,000,000 rows:

| | |
|---|---|
| Memory for status/type/queue/start/end | 126 MB |
| Sort by Status (counting, 1 pass) | 42 ms |
| Sort by Start desc (radix, 4 passes) | 1,137 ms |
| Status → Type → Start desc (3 keys) | 1,140 ms |

All verified ordered. Multi-key is nearly free: both sorts are stable, so you
run passes least-significant-key first and three keys cost about what one does.

`bench-naive.mjs` — the same data as an array of objects with `Array.sort`:
560 B/row, **OOM at 10M with a 4 GB heap**. So the claim is not "client-side
sorting doesn't scale", it's "an array of objects doesn't scale".

### Measured against a real Temporal frontend

| | |
|---|---|
| Max page size | **1000**, silently clamped — no error at 2000/5000/10000 |
| Transport | **HTTP/1.1**, no h2 → browsers cap at **6 connections per origin** |
| Wire encoding | **gzip**, 14.8x on real data, ~10x on high-entropy IDs |
| `ORDER BY` | **not supported at all** on sqlite visibility |
| JSON.parse | 1.26M rows/s single-threaded |

Two of these change the argument. Responses are gzipped, so 12M rows is ~430 MB
on the wire, not 6.8 GB — **bandwidth is not the constraint**. And `ORDER BY`
isn't merely limited to Start/End; on this store it is rejected outright.

The browser connection limit is a clean staircase — per-request cost flattens at
~8 ms from N=6 and wall time then grows one round at a time:

```
  N   wall    per-req
  1    78ms      78ms
  6    49ms       8ms
 12    92ms       8ms     <- 2 rounds
 24   180ms       8ms     <- 4 rounds
```

### Sharding: helps when latency-bound, useless when quota-bound

`demo-parallel.mjs` against `mock-visibility.mjs` at 12M rows. Each shard walks
its own token chain; pages are parsed straight into typed arrays and the JSON is
dropped, so peak memory tracks page-size × workers rather than total rows.

**No quota (latency-bound):**

| concurrency | wall | rows/s | peak RSS |
|---|---|---|---|
| 1 (sequential) | ~235 s | 51k | — |
| 6 (browser limit) | **39.9 s** | 301k | 412 MB |
| 16 | 28.3 s | 425k | 540 MB |
| 32 | 28.3 s | 424k | 671 MB |

12M rows in 40 s at the browser's real concurrency limit, and **the 6.7 GB
object array never exists at any point** — peak RSS 412 MB, columns 217 MB.

**Under a hard 50 RPS namespace quota:**

| concurrency | wall | rows/s | throttled |
|---|---|---|---|
| 6 | 23.6 s | 49,462 | 753 |
| 16 | 24.4 s | **47,822** | 1,247 |

Throughput pins to `RPS × page_size` exactly. More concurrency is *worse* — it
buys nothing and spends the extra requests on 429s. A client that fans out
maximally against a quota is just generating load.

### The defensible cap

```
cap = RPS × page_size × acceptable_wait
```

At 50 RPS and 1000 rows/page that's 50,000 rows/s → **500k rows in 10 s**. The
cap should be derived from the deployment's quota, not fixed at 10,000. The term
still missing is the real quota, which has to be measured where it matters.

## Running them

```bash
# ceiling of a real namespace — point at Cloud or staging
node bench/sort-sandbox/phase0-harness.mjs https://<host>/api/v1 <namespace> 1000 3

# sequential vs sharded against a real namespace
node bench/sort-sandbox/phase0-scan.mjs https://<host>/api/v1 <namespace>

# mock frontend reproducing every measured behaviour above
node bench/sort-sandbox/mock-visibility.mjs --rows 12000000 --rps 50

# sharded parallel pull into a columnar store
node --expose-gc bench/sort-sandbox/demo-parallel.mjs --rows 12000000 --levels 6,16

# sorting, in isolation
node bench/sort-sandbox/bench-columnar.mjs 12000000
node bench/sort-sandbox/bench-naive.mjs 1000000
```

## Caveats

- The RPS ceiling has **not** been measured against a representative deployment.
  A local dev server throttles on `System Persistence Max QPS Reached`, a
  dev-only persistence cap, at concurrency 1 — it measures your laptop's disk,
  not a namespace quota.
- `mock-visibility.mjs` synthesises rows from their index rather than storing
  them, with a lumpy but invertible index→time curve, so counts over a time
  range are exact and 12M is serveable. It is not a query engine: it understands
  the `StartTime` range predicates the sharder emits and treats everything else
  as match-all.
- Shard planning is sequential bisection — 347 shards cost 346 count calls and
  4.3 s at 12M. That is real overhead and would want parallelising.
