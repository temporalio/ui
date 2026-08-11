/**
 * Mock Visibility API — reproduces the behaviour measured against a real
 * Temporal frontend, at a scale a laptop can't actually store.
 *
 *   node mock-visibility.mjs [--rows 12000000] [--rps 0] [--latency 8]
 *                            [--jitter 4] [--max-page 1000] [--port 8401]
 *
 * Measured behaviours it reproduces:
 *   - page_size silently clamped to 1000 (no error)
 *   - gzip on the wire (real server measured 14.8x)
 *   - keyset nextPageToken, base64 JSON, same shape as the real one
 *   - ResourceExhausted (gRPC code 8 / HTTP 429) past a configurable RPS quota
 *   - no ORDER BY support — rejects it exactly like sqlite visibility does
 *
 * Rows are never stored. Row i is a pure function of i, and start times follow
 * a monotonic-but-lumpy index->time curve (business hours, weekday peaks) that
 * is invertible, so counts over a time range are exact and O(log n). That is
 * what makes 12M serveable and what makes shard bisection behave like it would
 * against real data.
 */

import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : Number(process.argv[i + 1]);
};

const TOTAL = arg('rows', 12_000_000);
const RPS = arg('rps', 0); // 0 = unlimited
const LATENCY = arg('latency', 8);
const JITTER = arg('jitter', 4);
const MAX_PAGE = arg('max-page', 1000);
const PORT = arg('port', 8401);
const WINDOW_HOURS = arg('window-hours', 720); // 30 days

// pinned to the minute so every cluster worker derives the identical
// index<->time curve; otherwise counts and pages disagree across workers
const NOW = Math.floor(Date.now() / 60_000) * 60_000;
const HOUR = 3600_000;
const WINDOW_START = NOW - WINDOW_HOURS * HOUR;

// ---------- deterministic hashing ----------
const hash32 = (x) => {
  x |= 0;
  x = (x + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  return (x ^ (x >>> 15)) >>> 0;
};
const rand01 = (i, salt) =>
  hash32(i ^ Math.imul(salt, 0x85ebca6b)) / 4294967296;

// ---------- lumpy but invertible index <-> time ----------
// Intensity per hour bucket, oldest -> newest. Real traffic is not uniform, and
// a uniform curve would make shard bisection look easier than it is.
const intensity = new Float64Array(WINDOW_HOURS);
for (let k = 0; k < WINDOW_HOURS; k++) {
  const date = new Date(WINDOW_START + k * HOUR);
  const hourOfDay = date.getUTCHours();
  const dayOfWeek = date.getUTCDay();
  const business = 0.25 + 0.75 * Math.exp(-(((hourOfDay - 15) / 4.5) ** 2));
  const weekend = dayOfWeek === 0 || dayOfWeek === 6 ? 0.28 : 1;
  const drift = 0.6 + (0.8 * k) / WINDOW_HOURS; // volume grows over the window
  const noise = 0.7 + 0.6 * rand01(k, 0x5bf03635);
  intensity[k] = business * weekend * drift * noise;
}

// counts per bucket, scaled so they sum to exactly TOTAL
const counts = new Float64Array(WINDOW_HOURS);
let intensitySum = 0;
for (let k = 0; k < WINDOW_HOURS; k++) intensitySum += intensity[k];
let assigned = 0;
for (let k = 0; k < WINDOW_HOURS; k++) {
  counts[k] = Math.floor((intensity[k] / intensitySum) * TOTAL);
  assigned += counts[k];
}
counts[WINDOW_HOURS - 1] += TOTAL - assigned;

// suffix[k] = rows in buckets k..end, i.e. rows at or newer than bucket k start.
// Index 0 is the newest row, so index increases as time decreases.
const suffix = new Float64Array(WINDOW_HOURS + 1);
for (let k = WINDOW_HOURS - 1; k >= 0; k--)
  suffix[k] = suffix[k + 1] + counts[k];

const bucketOfIndex = (index) => {
  let lo = 0;
  let hi = WINDOW_HOURS - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (suffix[mid] > index) lo = mid + 1;
    else hi = mid;
  }
  return Math.min(lo, WINDOW_HOURS - 1);
};

const indexToTime = (index) => {
  if (index <= 0) return NOW;
  if (index >= TOTAL) return WINDOW_START;
  const k = bucketOfIndex(index);
  const within = index - suffix[k + 1];
  const bucketEnd = WINDOW_START + (k + 1) * HOUR;
  const share = counts[k] > 0 ? (within + 1) / counts[k] : 0;
  return Math.round(bucketEnd - share * HOUR);
};

const timeToIndex = (ms) => {
  if (ms >= NOW) return 0;
  if (ms <= WINDOW_START) return TOTAL;
  const k = Math.min(
    WINDOW_HOURS - 1,
    Math.max(0, Math.floor((ms - WINDOW_START) / HOUR)),
  );
  const bucketEnd = WINDOW_START + (k + 1) * HOUR;
  const share = (bucketEnd - ms) / HOUR;
  return Math.round(suffix[k + 1] + share * counts[k]);
};

// ---------- row synthesis ----------
const TYPES = [
  'OrderFulfillmentWorkflow',
  'PaymentProcessingWorkflow',
  'UserOnboardingWorkflow',
  'InventorySyncWorkflow',
  'EmailNotificationWorkflow',
  'DataExportWorkflow',
  'SubscriptionRenewalWorkflow',
  'FraudReviewWorkflow',
];
const QUEUES = ['default', 'payments-tq', 'batch-processing'];
const STATUS = [
  ['WORKFLOW_EXECUTION_STATUS_RUNNING', 34],
  ['WORKFLOW_EXECUTION_STATUS_COMPLETED', 29],
  ['WORKFLOW_EXECUTION_STATUS_FAILED', 14],
  ['WORKFLOW_EXECUTION_STATUS_TIMED_OUT', 8],
  ['WORKFLOW_EXECUTION_STATUS_CANCELED', 6],
  ['WORKFLOW_EXECUTION_STATUS_TERMINATED', 5],
  ['WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW', 4],
];
const STATUS_TOTAL = STATUS.reduce((s, x) => s + x[1], 0);

const hex = (value, length) =>
  (value >>> 0).toString(16).padStart(8, '0').slice(0, length);

const kebab = (type) =>
  type
    .replace(/Workflow$/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

const rowAt = (index) => {
  const h1 = hash32(index);
  const h2 = hash32(index ^ 0x9e3779b9);
  const h3 = hash32(index + 0x7f4a7c15);

  const type = TYPES[h1 % TYPES.length];
  const queue = QUEUES[h2 % QUEUES.length];

  let roll = (h3 / 4294967296) * STATUS_TOTAL;
  let status = STATUS[0][0];
  for (const [name, weight] of STATUS) {
    roll -= weight;
    if (roll <= 0) {
      status = name;
      break;
    }
  }

  const startMs = indexToTime(index);
  const running = status === 'WORKFLOW_EXECUTION_STATUS_RUNNING';
  const durationMs = 1000 + ((h2 >>> 8) % 7_200_000);
  const closeMs = Math.min(NOW, startMs + durationMs);

  const workflowId = `${kebab(type)}-${hex(h1, 8)}${hex(h2, 4)}`;
  const runId = `${hex(h1, 8)}-${hex(h2, 4)}-4${hex(h2 >>> 4, 3)}-a${hex(h3, 3)}-${hex(h3, 8)}${hex(index, 4)}`;
  const startIso = new Date(startMs).toISOString();

  const row = {
    execution: { workflowId, runId },
    type: { name: type },
    startTime: startIso,
    executionTime: startIso,
    status,
    historyLength: String(6 + (h1 % 240)),
    historySizeBytes: String(1024 + (h2 % 65536)),
    stateTransitionCount: String(3 + (h3 % 60)),
    taskQueue: queue,
    memo: {},
    searchAttributes: {},
    rootExecution: { workflowId, runId },
  };
  if (!running) row.closeTime = new Date(closeMs).toISOString();
  return row;
};

// ---------- query parsing ----------
// Only what the sharder emits. Anything else is answered over the full range,
// which is the honest behaviour for a mock — it is not a query engine.
const parseRange = (query) => {
  if (!query) return { lo: WINDOW_START, hi: NOW + 60_000 };
  const gte = query.match(/StartTime\s*>=\s*"([^"]+)"/);
  const lt = query.match(/StartTime\s*<\s*"([^"]+)"/);
  return {
    lo: gte ? Date.parse(gte[1]) : WINDOW_START,
    hi: lt ? Date.parse(lt[1]) : NOW + 60_000,
  };
};

// ---------- rate limit ----------
let tokens = RPS;
let lastRefill = Date.now();
const allow = () => {
  if (!RPS) return true;
  const now = Date.now();
  tokens = Math.min(RPS, tokens + ((now - lastRefill) / 1000) * RPS);
  lastRefill = now;
  if (tokens < 1) return false;
  tokens -= 1;
  return true;
};

const encodeToken = (index) =>
  Buffer.from(
    JSON.stringify({
      CloseTime: '9999-12-31T23:59:59Z',
      StartTime: new Date(indexToTime(index)).toISOString(),
      Index: index,
    }),
  ).toString('base64');

const decodeToken = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString()).Index ?? null;
  } catch {
    return null;
  }
};

let served = { requests: 0, rows: 0, bytes: 0, throttled: 0 };

const send = (req, res, status, payload) => {
  const body = JSON.stringify(payload);
  const wantsGzip = /gzip/.test(req.headers['accept-encoding'] ?? '');
  const buffer = wantsGzip ? gzipSync(body, { level: 1 }) : Buffer.from(body);
  served.bytes += buffer.length;
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    ...(wantsGzip ? { 'content-encoding': 'gzip' } : {}),
  });
  res.end(buffer);
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  served.requests++;

  if (LATENCY || JITTER) {
    const wait = LATENCY + Math.random() * JITTER;
    await new Promise((r) => setTimeout(r, wait));
  }

  if (!allow()) {
    served.throttled++;
    return send(req, res, 429, {
      code: 8,
      message: 'namespace rate limit exceeded: ResourceExhausted',
      details: [],
    });
  }

  const query = url.searchParams.get('query') ?? '';
  if (/order\s+by/i.test(query)) {
    return send(req, res, 400, {
      code: 3,
      message: "invalid query: operation is not supported: 'order by' clause",
    });
  }

  const { lo, hi } = parseRange(query);
  const startIndex = timeToIndex(hi);
  const endIndex = timeToIndex(lo);

  if (url.pathname.endsWith('/workflow-count')) {
    return send(req, res, 200, {
      count: String(Math.max(0, endIndex - startIndex)),
    });
  }

  if (url.pathname.endsWith('/workflows')) {
    const requested = Number(url.searchParams.get('pageSize') ?? 100);
    // measured: the real frontend clamps silently rather than erroring
    const pageSize = Math.min(Math.max(1, requested), MAX_PAGE);
    const cursor =
      decodeToken(url.searchParams.get('nextPageToken')) ?? startIndex;
    const last = Math.min(cursor + pageSize, endIndex);

    const executions = [];
    for (let i = cursor; i < last; i++) executions.push(rowAt(i));
    served.rows += executions.length;

    return send(req, res, 200, {
      executions,
      nextPageToken: last < endIndex ? encodeToken(last) : '',
    });
  }

  if (url.pathname.endsWith('/stats')) {
    return send(req, res, 200, served);
  }

  send(req, res, 404, { code: 5, message: 'not found' });
});

const WORKERS = arg('workers', Math.max(1, availableParallelism() - 2));

if (cluster.isPrimary && WORKERS > 1) {
  for (let i = 0; i < WORKERS; i++) cluster.fork();
  console.log(`mock visibility API on http://localhost:${PORT}`);
  console.log(`  rows:        ${TOTAL.toLocaleString()}`);
  console.log(`  workers:     ${WORKERS}`);
  console.log(`  max page:    ${MAX_PAGE}`);
  console.log(`  rps quota:   ${RPS || 'unlimited'} (per worker)`);
  console.log(`  latency:     ${LATENCY}ms + up to ${JITTER}ms jitter`);
} else {
  server.listen(PORT, () => {
    console.log(`mock visibility API on http://localhost:${PORT}`);
    console.log(`  rows:        ${TOTAL.toLocaleString()}`);
    console.log(`  window:      ${WINDOW_HOURS}h`);
    console.log(`  max page:    ${MAX_PAGE}`);
    console.log(`  rps quota:   ${RPS || 'unlimited'}`);
    console.log(`  latency:     ${LATENCY}ms + up to ${JITTER}ms jitter`);
    console.log(
      `\n  GET /api/v1/namespaces/:ns/workflows?pageSize&query&nextPageToken`,
    );
    console.log(`  GET /api/v1/namespaces/:ns/workflow-count?query`);
  });
}
