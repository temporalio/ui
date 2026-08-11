/**
 * Sharded parallel pull, straight into a columnar store.
 *
 *   node demo-parallel.mjs [--base URL] [--rows N] [--shard 25000]
 *                          [--levels 1,2,4,6,8,16,32] [--sequential]
 *
 * Each shard walks its own token chain. Pages are parsed, written into the
 * shared typed arrays at the shard's offset, and the JSON is dropped
 * immediately — so peak memory tracks page-size x workers, not total rows.
 */

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};

const BASE = arg('base', 'http://localhost:8401/api/v1');
const NS = arg('ns', 'default');
const TARGET_ROWS = Number(arg('rows', 1_000_000));
const SHARD_TARGET = Number(arg('shard', 25_000));
const LEVELS = arg('levels', '1,2,4,6,8,16,32').split(',').map(Number);
const RUN_SEQUENTIAL = process.argv.includes('--sequential');
const PAGE_SIZE = 1000;

const listUrl = `${BASE}/namespaces/${NS}/workflows`;
const countUrl = `${BASE}/namespaces/${NS}/workflow-count`;

const HOUR = 3600_000;
const NOW = Date.now();
const iso = (ms) => new Date(ms).toISOString();
const range = (lo, hi) =>
  `StartTime >= "${iso(lo)}" AND StartTime < "${iso(hi)}"`;
const mb = (b) => (b / 1024 / 1024).toFixed(0) + ' MB';

let wireBytes = 0;
let requests = 0;

let throttled = 0;

// A client that ignores ResourceExhausted is not a client, it is an outage.
// Exponential backoff with jitter, which is what any real implementation of
// this has to do to live inside a namespace quota.
const getJson = async (url) => {
  let attempt = 0;
  for (;;) {
    requests++;
    const response = await fetch(url, {
      headers: { 'accept-encoding': 'gzip' },
    });
    const text = await response.text();
    wireBytes += text.length;

    if (response.status === 429) {
      throttled++;
      const backoff = Math.min(2000, 25 * 2 ** attempt) * (0.5 + Math.random());
      await new Promise((r) => setTimeout(r, backoff));
      attempt = Math.min(attempt + 1, 6);
      continue;
    }
    if (!response.ok) throw new Error(text.slice(0, 160));
    return JSON.parse(text);
  }
};

const count = async (query) =>
  Number(
    (await getJson(`${countUrl}?query=${encodeURIComponent(query)}`)).count ??
      0,
  );

// ---------- columnar store ----------
const TYPES = new Map();
const QUEUES = new Map();
const STATUSES = new Map();
const intern = (map, value) => {
  let id = map.get(value);
  if (id === undefined) {
    id = map.size;
    map.set(value, id);
  }
  return id;
};

let store = null;
const allocate = (rows) => {
  store = {
    capacity: rows,
    status: new Uint8Array(rows),
    type: new Uint8Array(rows),
    queue: new Uint8Array(rows),
    start: new Float64Array(rows),
    end: new Float64Array(rows),
    written: 0,
  };
  return (
    store.status.byteLength +
    store.type.byteLength +
    store.queue.byteLength +
    store.start.byteLength +
    store.end.byteLength
  );
};

const writeRow = (slot, row) => {
  if (slot >= store.capacity) return;
  store.status[slot] = intern(STATUSES, row.status);
  store.type[slot] = intern(TYPES, row.type.name);
  store.queue[slot] = intern(QUEUES, row.taskQueue);
  store.start[slot] = Date.parse(row.startTime);
  store.end[slot] = row.closeTime ? Date.parse(row.closeTime) : 0;
  store.written++;
};

// ---------- shard planning ----------
const bisect = async (lo, hi, rows, shards, depth = 0) => {
  if (rows <= SHARD_TARGET || depth > 26 || hi - lo <= 2) {
    if (rows > 0) shards.push({ lo, hi, rows });
    return;
  }
  const mid = Math.floor((lo + hi) / 2);
  const left = await count(range(lo, mid));
  await bisect(lo, mid, left, shards, depth + 1);
  await bisect(mid, hi, rows - left, shards, depth + 1);
};

// ---------- fetching ----------
const drainShard = async (shard, offset) => {
  const query = range(shard.lo, shard.hi);
  let token = '';
  let slot = offset;
  do {
    const params = new URLSearchParams({ pageSize: String(PAGE_SIZE), query });
    if (token) params.set('nextPageToken', token);
    const body = await getJson(`${listUrl}?${params}`);
    for (const row of body.executions) writeRow(slot++, row);
    token = body.nextPageToken || '';
    // body goes out of scope here; nothing accumulates
  } while (token);
  return slot - offset;
};

const pool = async (tasks, limit) => {
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) await tasks[next++]();
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );
};

// ---------- run ----------
// pick the newest window holding about TARGET_ROWS
let windowHours = 1;
let total = 0;
for (;;) {
  total = await count(range(NOW - windowHours * HOUR, NOW + 60_000));
  if (total >= TARGET_ROWS || windowHours >= 720) break;
  windowHours = Math.min(720, windowHours * 2);
}
const LO = NOW - windowHours * HOUR;
const HI = NOW + 60_000;

console.log(`target rows:   ${TARGET_ROWS.toLocaleString()}`);
console.log(
  `window:        newest ${windowHours}h  (${total.toLocaleString()} rows)`,
);
console.log(`page size:     ${PAGE_SIZE}`);
console.log(`shard target:  ${SHARD_TARGET.toLocaleString()} rows\n`);

requests = 0;
let t = performance.now();
const shards = [];
await bisect(LO, HI, total, shards);
const planMs = performance.now() - t;
const planRequests = requests;

const shardRows = shards.map((s) => s.rows);
console.log('--- shard plan (count-based bisection) ---');
console.log(`shards:        ${shards.length}`);
console.log(
  `cost:          ${planRequests} count calls, ${planMs.toFixed(0)}ms`,
);
console.log(
  `rows/shard:    min ${Math.min(...shardRows).toLocaleString()}, max ${Math.max(...shardRows).toLocaleString()}, mean ${Math.round(total / shards.length).toLocaleString()}`,
);
console.log(
  `imbalance:     ${(Math.max(...shardRows) / Math.min(...shardRows)).toFixed(2)}x\n`,
);

const offsets = [];
let running = 0;
for (const shard of shards) {
  offsets.push(running);
  running += shard.rows;
}

if (RUN_SEQUENTIAL) {
  const bytes = allocate(total);
  requests = 0;
  wireBytes = 0;
  t = performance.now();
  await drainShard({ lo: LO, hi: HI }, 0);
  const ms = performance.now() - t;
  console.log('--- sequential, one token chain (what the UI does today) ---');
  console.log(`wall:          ${(ms / 1000).toFixed(1)}s`);
  console.log(
    `rows/s:        ${Math.round(store.written / (ms / 1000)).toLocaleString()}`,
  );
  console.log(`requests:      ${requests.toLocaleString()}`);
  console.log(`columns:       ${mb(bytes)}\n`);
}

console.log('--- sharded, parallel token chains ---');
console.log(
  'conc      wall      rows/s   requests   peak RSS   speedup  throttled',
);
console.log('-'.repeat(73));

let baseline = null;
for (const level of LEVELS) {
  const columnBytes = allocate(total);
  requests = 0;
  wireBytes = 0;
  if (global.gc) global.gc();

  let peakRss = process.memoryUsage().rss;
  const sampler = setInterval(() => {
    peakRss = Math.max(peakRss, process.memoryUsage().rss);
  }, 25);

  t = performance.now();
  await pool(
    shards.map((shard, i) => () => drainShard(shard, offsets[i])),
    level,
  );
  const ms = performance.now() - t;
  clearInterval(sampler);

  if (baseline === null) baseline = ms;
  const rowsPerSec = store.written / (ms / 1000);

  console.log(
    String(level).padStart(4) +
      ((ms / 1000).toFixed(1) + 's').padStart(10) +
      Math.round(rowsPerSec).toLocaleString().padStart(12) +
      requests.toLocaleString().padStart(11) +
      mb(peakRss).padStart(11) +
      ((baseline / ms).toFixed(2) + 'x').padStart(9) +
      String(throttled).padStart(11),
  );
  throttled = 0;

  if (level === LEVELS[LEVELS.length - 1]) {
    console.log('');
    console.log(`rows written:  ${store.written.toLocaleString()}`);
    console.log(`columns:       ${mb(columnBytes)}`);
    console.log(
      `wire bytes:    ${mb(wireBytes)}  (${(wireBytes / store.written).toFixed(0)} B/row decompressed by fetch)`,
    );
    console.log(
      `dictionaries:  ${STATUSES.size} statuses, ${TYPES.size} types, ${QUEUES.size} queues`,
    );
  }
}
