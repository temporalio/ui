/**
 * Phase 0b — sequential vs sharded full scan.
 *
 *   node phase0-scan.mjs <baseUrl> <namespace> [pageSize] [shardTarget] [concurrency]
 *
 * Sequential follows one token chain, which is what the UI does today.
 * Sharded bisects on StartTime using count calls until every shard is under
 * shardTarget rows, then runs the shards concurrently — each with its own
 * independent token chain.
 */

const BASE = process.argv[2] ?? 'http://localhost:8301/api/v1';
const NS = process.argv[3] ?? 'sortbench';
const PAGE_SIZE = Number(process.argv[4] ?? 1000);
const SHARD_TARGET = Number(process.argv[5] ?? 2000);
const CONCURRENCY = Number(process.argv[6] ?? 8);

const listUrl = `${BASE}/namespaces/${NS}/workflows`;
const countUrl = `${BASE}/namespaces/${NS}/workflow-count`;

let requestCount = 0;
let byteCount = 0;

const getJson = async (url) => {
  requestCount++;
  const response = await fetch(url);
  const text = await response.text();
  byteCount += text.length;
  if (!response.ok) throw new Error(text.slice(0, 200));
  return JSON.parse(text);
};

const count = async (query) => {
  const url = query
    ? `${countUrl}?query=${encodeURIComponent(query)}`
    : countUrl;
  const body = await getJson(url);
  return Number(body.count ?? 0);
};

const fetchPage = async (query, token) => {
  const params = new URLSearchParams({ pageSize: String(PAGE_SIZE) });
  if (query) params.set('query', query);
  if (token) params.set('nextPageToken', token);
  const body = await getJson(`${listUrl}?${params}`);
  return {
    rows: body.executions?.length ?? 0,
    token: body.nextPageToken || '',
  };
};

const drain = async (query) => {
  let token = '';
  let rows = 0;
  do {
    const page = await fetchPage(query, token);
    rows += page.rows;
    token = page.token;
  } while (token);
  return rows;
};

const iso = (ms) => new Date(ms).toISOString();
const range = (lo, hi) =>
  `StartTime >= "${iso(lo)}" AND StartTime < "${iso(hi)}"`;

// Recursively bisect on time until each shard is under the target. Start times
// are lumpy, so an even time split is not an even row split — the count calls
// are what keep the shards balanced.
const bisect = async (lo, hi, rows, shards, depth = 0) => {
  if (rows <= SHARD_TARGET || depth > 24 || hi - lo <= 2) {
    if (rows > 0) shards.push({ lo, hi, rows });
    return;
  }
  const mid = Math.floor((lo + hi) / 2);
  const left = await count(range(lo, mid));
  await bisect(lo, mid, left, shards, depth + 1);
  await bisect(mid, hi, rows - left, shards, depth + 1);
};

const pool = async (tasks, limit) => {
  let next = 0;
  const results = [];
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );
  return results;
};

const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';

// ---------- run ----------
const total = await count('');
console.log(`namespace:   ${NS}`);
console.log(`total rows:  ${total.toLocaleString()}`);
console.log(`page size:   ${PAGE_SIZE}\n`);

// sequential
requestCount = 0;
byteCount = 0;
let t = performance.now();
const seqRows = await drain('');
const seqMs = performance.now() - t;
const seqRequests = requestCount;
const seqBytes = byteCount;
console.log('--- sequential (one token chain, what the UI does today) ---');
console.log(`rows:      ${seqRows.toLocaleString()}`);
console.log(`requests:  ${seqRequests}`);
console.log(`wall:      ${seqMs.toFixed(0)}ms`);
console.log(
  `rows/s:    ${Math.round(seqRows / (seqMs / 1000)).toLocaleString()}`,
);
console.log(
  `bytes:     ${mb(seqBytes)}  (${(seqBytes / Math.max(1, seqRows)).toFixed(0)} B/row)\n`,
);

// sharded
const now = Date.now();
const shards = [];
requestCount = 0;
byteCount = 0;
t = performance.now();
const WINDOW_MIN = Number(process.env.WINDOW_MIN ?? 30 * 24 * 60);
await bisect(now - WINDOW_MIN * 60_000, now + 60_000, total, shards);
const bisectMs = performance.now() - t;
const bisectRequests = requestCount;

console.log('--- sharded (time-bisected, independent token chains) ---');
console.log(`shards:            ${shards.length}`);
console.log(
  `bisect cost:       ${bisectRequests} count calls, ${bisectMs.toFixed(0)}ms`,
);
console.log(
  `shard rows:        min ${Math.min(...shards.map((s) => s.rows))}, max ${Math.max(...shards.map((s) => s.rows))}`,
);

requestCount = 0;
byteCount = 0;
t = performance.now();
const shardRows = await pool(
  shards.map((s) => () => drain(range(s.lo, s.hi))),
  CONCURRENCY,
);
const parMs = performance.now() - t;
const parTotal = shardRows.reduce((a, b) => a + b, 0);

console.log(`concurrency:       ${CONCURRENCY}`);
console.log(`rows:              ${parTotal.toLocaleString()}`);
console.log(`requests:          ${requestCount}`);
console.log(`wall:              ${parMs.toFixed(0)}ms`);
console.log(
  `rows/s:            ${Math.round(parTotal / (parMs / 1000)).toLocaleString()}`,
);
console.log(`bytes:             ${mb(byteCount)}`);
console.log(`\nspeedup:           ${(seqMs / parMs).toFixed(2)}x`);
console.log(
  `speedup incl. bisect: ${(seqMs / (parMs + bisectMs)).toFixed(2)}x`,
);
