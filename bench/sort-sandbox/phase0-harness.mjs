/**
 * Phase 0 harness — Visibility API ceiling.
 *
 * Ramps concurrent ListWorkflowExecutions calls against one namespace and
 * reports sustained RPS, latency, throttling, and bytes on the wire.
 *
 *   node phase0-harness.mjs <baseUrl> <namespace> [pageSize] [secondsPerLevel]
 *
 * Point it at any deployment. The numbers only mean something against the
 * deployment you actually care about — a local dev server measures your
 * laptop's disk, not a namespace quota.
 */

const BASE = process.argv[2] ?? 'http://localhost:8081/api/v1';
const NS = process.argv[3] ?? 'default';
const PAGE_SIZE = Number(process.argv[4] ?? 1000);
const SECONDS = Number(process.argv[5] ?? 3);
const LEVELS = [1, 2, 4, 8, 16, 32, 64];

const url = `${BASE}/namespaces/${NS}/workflows?pageSize=${PAGE_SIZE}`;

const pct = (sorted, p) =>
  sorted.length
    ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
    : 0;

// RESOURCE_EXHAUSTED is gRPC code 8; the HTTP gateway also surfaces it as 429.
const isThrottle = (status, body) =>
  status === 429 ||
  body?.code === 8 ||
  /resource.?exhausted/i.test(body?.message ?? '');

const runLevel = async (concurrency) => {
  const deadline = Date.now() + SECONDS * 1000;
  const latencies = [];
  let ok = 0;
  let throttled = 0;
  let failed = 0;
  let bytes = 0;
  let rows = 0;

  const worker = async () => {
    while (Date.now() < deadline) {
      const started = performance.now();
      try {
        const response = await fetch(url);
        const text = await response.text();
        const elapsed = performance.now() - started;

        let body;
        try {
          body = JSON.parse(text);
        } catch {
          body = null;
        }

        if (isThrottle(response.status, body)) {
          throttled++;
        } else if (!response.ok || body?.code) {
          failed++;
        } else {
          ok++;
          latencies.push(elapsed);
          bytes += text.length;
          rows += body?.executions?.length ?? 0;
        }
      } catch {
        failed++;
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  latencies.sort((a, b) => a - b);
  return {
    concurrency,
    rps: ok / SECONDS,
    rowsPerSec: rows / SECONDS,
    p50: pct(latencies, 0.5),
    p95: pct(latencies, 0.95),
    throttled,
    failed,
    bytesPerRow: rows ? bytes / rows : 0,
  };
};

console.log(`target:     ${url}`);
console.log(`per level:  ${SECONDS}s\n`);
console.log(
  'conc   req/s    rows/s      p50      p95   throttled  failed   B/row',
);
console.log('-'.repeat(72));

const results = [];
for (const level of LEVELS) {
  const r = await runLevel(level);
  results.push(r);
  console.log(
    String(r.concurrency).padStart(4) +
      r.rps.toFixed(1).padStart(8) +
      Math.round(r.rowsPerSec).toLocaleString().padStart(10) +
      (r.p50.toFixed(0) + 'ms').padStart(9) +
      (r.p95.toFixed(0) + 'ms').padStart(9) +
      String(r.throttled).padStart(12) +
      String(r.failed).padStart(8) +
      r.bytesPerRow.toFixed(0).padStart(8),
  );
  // let the server settle between levels
  await new Promise((r) => setTimeout(r, 500));
}

const best = results.reduce((a, b) => (b.rowsPerSec > a.rowsPerSec ? b : a));
const firstThrottled = results.find((r) => r.throttled > 0);

console.log('\n--- ceiling ---');
console.log(
  `peak rows/s:        ${Math.round(best.rowsPerSec).toLocaleString()} at concurrency ${best.concurrency}`,
);
console.log(`peak req/s:         ${best.rps.toFixed(1)}`);
console.log(
  `first throttling:   ${firstThrottled ? `concurrency ${firstThrottled.concurrency}` : 'never observed in this range'}`,
);
console.log(`bytes per row:      ${best.bytesPerRow.toFixed(0)} B`);

const at = (seconds) => Math.round(best.rowsPerSec * seconds).toLocaleString();
console.log('\n--- rows reachable at peak (no headroom reserved) ---');
console.log(`  10s:  ${at(10)}`);
console.log(`  60s:  ${at(60)}`);
console.log(`  5min: ${at(300)}`);
