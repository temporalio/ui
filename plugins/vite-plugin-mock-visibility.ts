import { gzipSync } from 'node:zlib';

import type { Connect, Plugin, PreviewServer, ViteDevServer } from 'vite';

/**
 * POC only. Serves a fake Visibility API at /mock-visibility so the sort
 * sandbox can be demoed at namespace scale without a cluster.
 *
 * It reproduces the behaviours measured against a real Temporal frontend:
 *   - page_size silently clamped to 1000 (no error)
 *   - gzip on the wire
 *   - keyset nextPageToken, same shape as the real one
 *   - ResourceExhausted (gRPC code 8 / HTTP 429) past an optional RPS quota
 *   - no ORDER BY support — rejected exactly like sqlite visibility does
 *
 * Rows are never stored. Row i is a pure function of i, and start times follow
 * a monotonic-but-lumpy index->time curve so counts over a time range are exact
 * and O(log n). That is what makes millions of rows serveable from a plugin,
 * and what makes shard bisection behave like it would against real data.
 */

const MAX_PAGE_SIZE = 1000;
const WINDOW_HOURS = 720;
const HOUR = 3_600_000;

const WORKFLOW_TYPES = [
  'OrderFulfillmentWorkflow',
  'PaymentProcessingWorkflow',
  'UserOnboardingWorkflow',
  'InventorySyncWorkflow',
  'EmailNotificationWorkflow',
  'DataExportWorkflow',
  'SubscriptionRenewalWorkflow',
  'FraudReviewWorkflow',
];
const TASK_QUEUES = ['default', 'payments-tq', 'batch-processing'];
const STATUSES: [string, number][] = [
  ['WORKFLOW_EXECUTION_STATUS_RUNNING', 34],
  ['WORKFLOW_EXECUTION_STATUS_COMPLETED', 29],
  ['WORKFLOW_EXECUTION_STATUS_FAILED', 14],
  ['WORKFLOW_EXECUTION_STATUS_TIMED_OUT', 8],
  ['WORKFLOW_EXECUTION_STATUS_CANCELED', 6],
  ['WORKFLOW_EXECUTION_STATUS_TERMINATED', 5],
  ['WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW', 4],
];
const STATUS_TOTAL = STATUSES.reduce((sum, entry) => sum + entry[1], 0);

const hash32 = (value: number) => {
  let x = (value + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  return (x ^ (x >>> 15)) >>> 0;
};

const kebab = (type: string) =>
  type
    .replace(/Workflow$/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

const PREFIXES = WORKFLOW_TYPES.map(kebab);
const HEX = '0123456789abcdef';
const hexOf = (value: number, length: number) => {
  let out = '';
  for (let i = 0; i < length; i++) out += HEX[(value >>> (i * 4)) & 15];
  return out;
};

// Pinned to the minute so every request derives the identical curve.
const NOW = Math.floor(Date.now() / 60_000) * 60_000;
const WINDOW_START = NOW - WINDOW_HOURS * HOUR;

type Curve = { counts: Float64Array; suffix: Float64Array; total: number };
const curves = new Map<number, Curve>();

/** Lumpy but invertible index<->time curve: business hours, weekday peaks. */
const curveFor = (total: number): Curve => {
  const cached = curves.get(total);
  if (cached) return cached;

  const intensity = new Float64Array(WINDOW_HOURS);
  for (let k = 0; k < WINDOW_HOURS; k++) {
    const date = new Date(WINDOW_START + k * HOUR);
    const hourOfDay = date.getUTCHours();
    const dayOfWeek = date.getUTCDay();
    const business = 0.25 + 0.75 * Math.exp(-(((hourOfDay - 15) / 4.5) ** 2));
    const weekend = dayOfWeek === 0 || dayOfWeek === 6 ? 0.28 : 1;
    const drift = 0.6 + (0.8 * k) / WINDOW_HOURS;
    const noise = 0.7 + 0.6 * (hash32(k ^ 0x5bf03635) / 4294967296);
    intensity[k] = business * weekend * drift * noise;
  }

  let intensitySum = 0;
  for (let k = 0; k < WINDOW_HOURS; k++) intensitySum += intensity[k];

  const counts = new Float64Array(WINDOW_HOURS);
  let assigned = 0;
  for (let k = 0; k < WINDOW_HOURS; k++) {
    counts[k] = Math.floor((intensity[k] / intensitySum) * total);
    assigned += counts[k];
  }
  counts[WINDOW_HOURS - 1] += total - assigned;

  const suffix = new Float64Array(WINDOW_HOURS + 1);
  for (let k = WINDOW_HOURS - 1; k >= 0; k--)
    suffix[k] = suffix[k + 1] + counts[k];

  const curve = { counts, suffix, total };
  curves.set(total, curve);
  return curve;
};

const indexToTime = (curve: Curve, index: number) => {
  if (index <= 0) return NOW;
  if (index >= curve.total) return WINDOW_START;
  let lo = 0;
  let hi = WINDOW_HOURS - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (curve.suffix[mid] > index) lo = mid + 1;
    else hi = mid;
  }
  const k = Math.min(lo, WINDOW_HOURS - 1);
  const within = index - curve.suffix[k + 1];
  const share = curve.counts[k] > 0 ? (within + 1) / curve.counts[k] : 0;
  return Math.round(WINDOW_START + (k + 1) * HOUR - share * HOUR);
};

const timeToIndex = (curve: Curve, ms: number) => {
  if (ms >= NOW) return 0;
  if (ms <= WINDOW_START) return curve.total;
  const k = Math.min(
    WINDOW_HOURS - 1,
    Math.max(0, Math.floor((ms - WINDOW_START) / HOUR)),
  );
  const share = (WINDOW_START + (k + 1) * HOUR - ms) / HOUR;
  return Math.round(curve.suffix[k + 1] + share * curve.counts[k]);
};

type Predicate = { field: string; operator: string; value: string };

const parsePredicates = (query: string): Predicate[] => {
  const out: Predicate[] = [];
  const term = /(\w+)\s*(!?=)\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = term.exec(query))) {
    const [, field, operator, value] = match;
    if (field === 'StartTime') continue;
    out.push({ field, operator, value });
  }
  return out;
};

const matches = (
  predicates: Predicate[],
  status: string,
  type: string,
  queue: string,
) =>
  predicates.every((predicate) => {
    const actual =
      predicate.field === 'ExecutionStatus'
        ? status
        : predicate.field === 'WorkflowType'
          ? type
          : predicate.field === 'TaskQueue'
            ? queue
            : null;
    if (actual === null) return true; // unknown field: not filtered
    return predicate.operator === '='
      ? actual === predicate.value
      : actual !== predicate.value;
  });

const rowAt = (curve: Curve, index: number) => {
  const h1 = hash32(index);
  const h2 = hash32(index ^ 0x9e3779b9);
  const h3 = hash32(index + 0x7f4a7c15);

  const typeIndex = h1 % WORKFLOW_TYPES.length;
  const queueIndex = h2 % TASK_QUEUES.length;

  let roll = (h3 / 4294967296) * STATUS_TOTAL;
  let statusIndex = 0;
  for (let s = 0; s < STATUSES.length; s++) {
    roll -= STATUSES[s][1];
    if (roll <= 0) {
      statusIndex = s;
      break;
    }
  }

  const startMs = indexToTime(curve, index);
  const running = statusIndex === 0;
  const closeMs = Math.min(NOW, startMs + 1000 + (h2 % 7_200_000));
  // hash32 is a 32-bit mix and is not injective — at 12M rows the birthday
  // bound predicts thousands of collisions, which shows up as duplicate
  // workflow and run IDs. The index is embedded so every ID is unique.
  const workflowId = `${PREFIXES[typeIndex]}-${hexOf(h1, 6)}${hexOf(index, 7)}`;
  const runId = `${hexOf(h1, 8)}-${hexOf(h2, 4)}-4${hexOf(h2 >>> 4, 3)}-a${hexOf(h3, 3)}-${hexOf(h3, 4)}${hexOf(index, 8)}`;
  const startIso = new Date(startMs).toISOString();

  return {
    status: STATUSES[statusIndex][0],
    type: WORKFLOW_TYPES[typeIndex],
    queue: TASK_QUEUES[queueIndex],
    row: {
      execution: { workflowId, runId },
      type: { name: WORKFLOW_TYPES[typeIndex] },
      startTime: startIso,
      executionTime: startIso,
      status: STATUSES[statusIndex][0],
      historyLength: String(6 + (h1 % 240)),
      historySizeBytes: String(1024 + (h2 % 65536)),
      stateTransitionCount: String(3 + (h3 % 60)),
      taskQueue: TASK_QUEUES[queueIndex],
      memo: {},
      searchAttributes: {},
      ...(running ? {} : { closeTime: new Date(closeMs).toISOString() }),
    },
  };
};

const encodeToken = (curve: Curve, index: number) =>
  Buffer.from(
    JSON.stringify({
      CloseTime: '9999-12-31T23:59:59Z',
      StartTime: new Date(indexToTime(curve, index)).toISOString(),
      Index: index,
    }),
  ).toString('base64');

const decodeToken = (token: string | null): number | null => {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString()).Index ?? null;
  } catch {
    return null;
  }
};

let tokens = 0;
let lastRefill = Date.now();
const allow = (rps: number) => {
  if (!rps) return true;
  const now = Date.now();
  tokens = Math.min(rps, tokens + ((now - lastRefill) / 1000) * rps);
  lastRefill = now;
  if (tokens < 1) return false;
  tokens -= 1;
  return true;
};

const middleware = (): Connect.NextHandleFunction => (req, res, next) => {
  if (!req.url?.startsWith('/mock-visibility/')) return next();

  const url = new URL(req.url, 'http://localhost');
  const params = url.searchParams;
  const total = Number(params.get('total')) || 12_000_000;
  const rps = Number(params.get('rps')) || 0;
  const curve = curveFor(total);

  const send = (status: number, payload: unknown) => {
    const body = JSON.stringify(payload);
    const wantsGzip = /gzip/.test(req.headers['accept-encoding'] ?? '');
    const buffer = wantsGzip ? gzipSync(body, { level: 1 }) : Buffer.from(body);
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    if (wantsGzip) res.setHeader('content-encoding', 'gzip');
    res.end(buffer);
  };

  if (!allow(rps)) {
    return send(429, {
      code: 8,
      message: 'namespace rate limit exceeded: ResourceExhausted',
    });
  }

  const query = params.get('query') ?? '';
  if (/order\s+by/i.test(query)) {
    return send(400, {
      code: 3,
      message: "invalid query: operation is not supported: 'order by' clause",
    });
  }

  const gte = /StartTime\s*>=\s*"([^"]+)"/.exec(query);
  const lt = /StartTime\s*<\s*"([^"]+)"/.exec(query);
  const lo = gte ? Date.parse(gte[1]) : WINDOW_START;
  const hi = lt ? Date.parse(lt[1]) : NOW + 60_000;
  const startIndex = timeToIndex(curve, hi);
  const endIndex = timeToIndex(curve, lo);
  const predicates = parsePredicates(query);

  if (url.pathname.endsWith('/workflow-count')) {
    const span = Math.max(0, endIndex - startIndex);
    if (!predicates.length) return send(200, { count: String(span) });

    // Sample rather than scan: a real count call does not walk rows either, and
    // shard planning only needs the distribution to be roughly right.
    const SAMPLE = Math.min(span, 2000);
    let hits = 0;
    for (let i = 0; i < SAMPLE; i++) {
      const index = startIndex + Math.floor((i / SAMPLE) * span);
      const entry = rowAt(curve, index);
      if (matches(predicates, entry.status, entry.type, entry.queue)) hits++;
    }
    const estimate = SAMPLE ? Math.round((hits / SAMPLE) * span) : 0;
    return send(200, { count: String(estimate) });
  }

  if (url.pathname.endsWith('/workflows')) {
    const requested = Number(params.get('pageSize')) || 100;
    const pageSize = Math.min(Math.max(1, requested), MAX_PAGE_SIZE);
    const cursor = decodeToken(params.get('nextPageToken')) ?? startIndex;

    const executions: unknown[] = [];
    let index = cursor;
    // scan forward until the page is full or the range is exhausted
    while (index < endIndex && executions.length < pageSize) {
      const entry = rowAt(curve, index);
      if (matches(predicates, entry.status, entry.type, entry.queue)) {
        executions.push(entry.row);
      }
      index++;
    }

    return send(200, {
      executions,
      nextPageToken: index < endIndex ? encodeToken(curve, index) : '',
    });
  }

  return send(404, { code: 5, message: 'not found' });
};

export function mockVisibilityPlugin(): Plugin {
  return {
    name: 'vite-plugin-mock-visibility',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(middleware());
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(middleware());
    },
  };
}
