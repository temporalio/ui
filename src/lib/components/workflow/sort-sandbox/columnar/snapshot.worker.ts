/**
 * Owns the snapshot. Everything expensive happens here so the main thread stays
 * responsive while 12M rows are loaded, sorted and filtered.
 *
 * The main thread never receives the columns — it asks for a window of rows to
 * render and gets back only those. That is what keeps a 560 MB store off the UI
 * thread and out of every structured clone.
 */

import {
  countingSortU8,
  msdRadixSortStrings,
  radixSortTimestamps,
  type SortDirection,
} from './sort';
import {
  allocate,
  bytesUsed,
  type DisplayRow,
  ID_WIDTH,
  intern,
  materialize,
  RUN_WIDTH,
  type SandboxColumns,
  writePacked,
} from './store';

type SortKey =
  | 'status'
  | 'workflowId'
  | 'type'
  | 'startTime'
  | 'endTime'
  | 'taskQueue';

type SortTerm = { key: SortKey; direction: SortDirection };

type QueryPredicate = {
  field: 'ExecutionStatus' | 'WorkflowType' | 'TaskQueue';
  operator: '=' | '!=';
  value: string;
};

type Request =
  | { id: number; type: 'load'; rows: number; query: string }
  | { id: number; type: 'sort'; terms: SortTerm[] }
  | {
      id: number;
      type: 'filter';
      text: string;
      statuses: string[];
      workflowType: string;
    }
  | { id: number; type: 'window'; offset: number; limit: number };

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
const STATUSES = [
  ['Running', 34],
  ['Completed', 29],
  ['Failed', 14],
  ['TimedOut', 8],
  ['Canceled', 6],
  ['Terminated', 5],
  ['ContinuedAsNew', 4],
] as const;
const STATUS_TOTAL = STATUSES.reduce((sum, entry) => sum + entry[1], 0);

const HEX = '0123456789abcdef';
const WINDOW_MS = 30 * 24 * 3600_000;

const hash32 = (x: number) => {
  x = (x + 0x9e3779b9) | 0;
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

let columns: SandboxColumns | null = null;
let order: Uint32Array | null = null; // sorted row ids
let view: Uint32Array | null = null; // sorted + filtered row ids
let scratch: Uint32Array | null = null;

const post = (message: unknown) =>
  (self as unknown as Worker).postMessage(message);

const hexOf = (value: number, length: number) => {
  let out = '';
  for (let i = 0; i < length; i++) out += HEX[(value >>> (i * 4)) & 15];
  return out;
};

const BASE = '/mock-visibility/namespaces/default';
const PAGE_SIZE = 1000; // the server clamps to this anyway
const CONCURRENCY = 6; // browsers allow 6 connections per origin on HTTP/1.1
const SHARD_TARGET = 60_000;

const iso = (ms: number) => new Date(ms).toISOString();
const rangeClause = (lo: number, hi: number) =>
  `StartTime >= "${iso(lo)}" AND StartTime < "${iso(hi)}"`;

let requestCount = 0;
let throttledCount = 0;
let wireBytes = 0;

const getJson = async (url: string): Promise<Record<string, never>> => {
  for (let attempt = 0; ; attempt++) {
    requestCount++;
    const response = await fetch(url);
    const text = await response.text();
    wireBytes += text.length;

    if (response.status === 429) {
      // a client that ignores ResourceExhausted is not a client, it is an outage
      throttledCount++;
      const backoff = Math.min(2000, 25 * 2 ** attempt) * (0.5 + Math.random());
      await new Promise((resolve) => setTimeout(resolve, backoff));
      continue;
    }
    if (!response.ok) throw new Error(text.slice(0, 200));
    return JSON.parse(text);
  }
};

const countFor = async (total: number, query: string) => {
  const params = new URLSearchParams({ total: String(total) });
  if (query) params.set('query', query);
  const body = await getJson(`${BASE}/workflow-count?${params}`);
  return Number((body as { count?: string }).count ?? 0);
};

type Shard = { lo: number; hi: number; rows: number };

/**
 * Start times are lumpy, so an even split of time is not an even split of rows.
 * Count calls are cheap and paging is not, so bisect on counts.
 */
const planShards = async (
  total: number,
  baseQuery: string,
  lo: number,
  hi: number,
  rows: number,
  shards: Shard[],
  depth = 0,
) => {
  if (rows <= SHARD_TARGET || depth > 24 || hi - lo <= 2) {
    if (rows > 0) shards.push({ lo, hi, rows });
    return;
  }
  const mid = Math.floor((lo + hi) / 2);
  const left = await countFor(
    total,
    [baseQuery, rangeClause(lo, mid)].filter(Boolean).join(' AND '),
  );
  await planShards(total, baseQuery, lo, mid, left, shards, depth + 1);
  await planShards(total, baseQuery, mid, hi, rows - left, shards, depth + 1);
};

/** Re-assigns dictionary ids in alphabetical order and rewrites the column. */
const normalizeDictionary = (
  names: string[],
  column: Uint8Array,
  count: number,
) => {
  const ranked = names
    .map((name, id) => ({ name, id }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  const remap = new Uint8Array(Math.max(1, names.length));
  ranked.forEach((entry, rank) => {
    remap[entry.id] = rank;
  });
  for (let i = 0; i < count; i++) column[i] = remap[column[i]];

  names.length = 0;
  for (const entry of ranked) names.push(entry.name);
};

const STATUS_LABEL: Record<string, string> = {
  WORKFLOW_EXECUTION_STATUS_RUNNING: 'Running',
  WORKFLOW_EXECUTION_STATUS_COMPLETED: 'Completed',
  WORKFLOW_EXECUTION_STATUS_FAILED: 'Failed',
  WORKFLOW_EXECUTION_STATUS_TIMED_OUT: 'TimedOut',
  WORKFLOW_EXECUTION_STATUS_CANCELED: 'Canceled',
  WORKFLOW_EXECUTION_STATUS_TERMINATED: 'Terminated',
  WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW: 'ContinuedAsNew',
};

/**
 * Pulls every matching row over HTTP, sharded so the token chains run in
 * parallel, writing each page straight into the columns and dropping the JSON.
 * Peak memory tracks page size x workers rather than total rows, so the object
 * array that would OOM the tab never exists at any point.
 */
const load = async (total: number, baseQuery: string, id: number) => {
  requestCount = 0;
  throttledCount = 0;
  wireBytes = 0;
  const startedAt = performance.now();

  const matching = await countFor(total, baseQuery);
  const capacity = Math.ceil(matching * 1.05) + 1000;

  const cols = allocate(capacity);
  columns = cols;
  const rowOrder = new Uint32Array(capacity);
  order = rowOrder;
  scratch = new Uint32Array(capacity);

  const now = Date.now();
  const windowMs = 720 * 3600_000;
  const shards: Shard[] = [];
  await planShards(
    total,
    baseQuery,
    now - windowMs,
    now + 60_000,
    matching,
    shards,
  );

  post({
    id,
    type: 'planned',
    shards: shards.length,
    matching,
    requests: requestCount,
    elapsedMs: performance.now() - startedAt,
  });

  let written = 0;
  let shardsDone = 0;
  let lastPost = 0;

  const drain = async (shard: Shard) => {
    const query = [baseQuery, rangeClause(shard.lo, shard.hi)]
      .filter(Boolean)
      .join(' AND ');
    let token = '';
    do {
      const params = new URLSearchParams({
        total: String(total),
        pageSize: String(PAGE_SIZE),
        query,
      });
      if (token) params.set('nextPageToken', token);
      const body = (await getJson(
        `${BASE}/workflows?${params}`,
      )) as unknown as {
        executions: {
          execution: { workflowId: string; runId: string };
          type: { name: string };
          startTime: string;
          closeTime?: string;
          status: string;
          taskQueue: string;
        }[];
        nextPageToken: string;
      };

      for (const row of body.executions) {
        if (written >= capacity) break;
        const slot = written++;
        cols.status[slot] = intern(
          cols.statusNames,
          STATUS_LABEL[row.status] ?? 'Unspecified',
        );
        cols.type[slot] = intern(cols.typeNames, row.type.name);
        cols.queue[slot] = intern(cols.queueNames, row.taskQueue);
        cols.start[slot] = Date.parse(row.startTime);
        cols.end[slot] = row.closeTime ? Date.parse(row.closeTime) : 0;
        writePacked(cols.workflowId, slot, ID_WIDTH, row.execution.workflowId);
        writePacked(cols.runId, slot, RUN_WIDTH, row.execution.runId);
        rowOrder[slot] = slot;
      }
      cols.count = written;
      token = body.nextPageToken || '';

      const elapsedMs = performance.now() - startedAt;
      if (elapsedMs - lastPost > 120) {
        lastPost = elapsedMs;
        post({
          id,
          type: 'progress',
          loaded: written,
          scanned: written,
          total: matching,
          shardsDone,
          shardCount: shards.length,
          requests: requestCount,
          throttled: throttledCount,
          wireBytes,
          elapsedMs,
        });
      }
      // body goes out of scope here; nothing accumulates
    } while (token);
    shardsDone++;
    post({
      id,
      type: 'shard',
      index: shardsDone,
      of: shards.length,
      rows: shard.rows,
      from: iso(shard.lo),
      to: iso(shard.hi),
      elapsedMs: performance.now() - startedAt,
    });
  };

  // a fixed pool, sized to what the browser will actually run in parallel
  let next = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (next < shards.length) await drain(shards[next++]);
  });
  await Promise.all(workers);

  cols.count = written;

  // Counting sort orders by dictionary id, and ids are handed out in the order
  // values first arrive from the API — which is arrival order, not alphabetical.
  // Without this, "Status A→Z" sorts by whatever turned up first.
  normalizeDictionary(cols.statusNames, cols.status, written);
  normalizeDictionary(cols.typeNames, cols.type, written);
  normalizeDictionary(cols.queueNames, cols.queue, written);

  view = rowOrder.slice(0, written);
  post({
    id,
    type: 'loaded',
    count: written,
    bytes: bytesUsed(cols),
    requests: requestCount,
    throttled: throttledCount,
    wireBytes,
    shards: shards.length,
    elapsedMs: performance.now() - startedAt,
  });
};

const sort = (terms: SortTerm[], id: number) => {
  const cols = columns;
  if (!cols || !order || !scratch) return;
  const started = performance.now();

  // reset to natural order, then apply stable passes least-significant first
  for (let i = 0; i < cols.count; i++) order[i] = i;

  for (let t = terms.length - 1; t >= 0; t--) {
    const { key, direction } = terms[t];
    if (key === 'status')
      countingSortU8(order, scratch, cols.status, direction);
    else if (key === 'type')
      countingSortU8(order, scratch, cols.type, direction);
    else if (key === 'taskQueue')
      countingSortU8(order, scratch, cols.queue, direction);
    else if (key === 'startTime')
      radixSortTimestamps(order, scratch, cols.start, direction);
    else if (key === 'endTime')
      radixSortTimestamps(order, scratch, cols.end, direction);
    else if (key === 'workflowId')
      msdRadixSortStrings(order, scratch, cols.workflowId, ID_WIDTH, direction);
  }

  post({ id, type: 'sorted', ms: performance.now() - started });
};

/** Substring search directly on packed bytes — no string is materialised. */
const packedIncludes = (
  bytes: Uint8Array,
  row: number,
  width: number,
  needle: Uint8Array,
): boolean => {
  const base = row * width;
  const last = width - needle.length;
  outer: for (let offset = 0; offset <= last; offset++) {
    for (let k = 0; k < needle.length; k++) {
      if (bytes[base + offset + k] !== needle[k]) continue outer;
    }
    return true;
  }
  return false;
};

const filter = (
  text: string,
  statuses: string[],
  workflowType: string,
  id: number,
) => {
  const cols = columns;
  if (!cols || !order) return;
  const started = performance.now();

  const needle = text.trim().toLowerCase();
  const needleBytes = new Uint8Array(needle.length);
  for (let i = 0; i < needle.length; i++) needleBytes[i] = needle.charCodeAt(i);

  const statusIds = new Set(
    statuses
      .map((name) => cols.statusNames.indexOf(name))
      .filter((index) => index >= 0),
  );
  const typeId = workflowType ? cols.typeNames.indexOf(workflowType) : -1;

  // Dictionary columns only have a handful of distinct values, so decide once
  // per value rather than once per row.
  const typeMatches = cols.typeNames.map((name) =>
    needle ? name.toLowerCase().includes(needle) : true,
  );
  const queueMatches = cols.queueNames.map((name) =>
    needle ? name.toLowerCase().includes(needle) : true,
  );

  if (!needle && !statusIds.size && typeId < 0) {
    view = order.slice(0, cols.count);
  } else {
    const next = new Uint32Array(cols.count);
    let written = 0;
    for (let i = 0; i < cols.count; i++) {
      const row = order[i];
      if (statusIds.size && !statusIds.has(cols.status[row])) continue;
      if (typeId >= 0 && cols.type[row] !== typeId) continue;
      if (
        needle &&
        !typeMatches[cols.type[row]] &&
        !queueMatches[cols.queue[row]] &&
        !packedIncludes(cols.workflowId, row, ID_WIDTH, needleBytes) &&
        !packedIncludes(cols.runId, row, RUN_WIDTH, needleBytes)
      ) {
        continue;
      }
      next[written++] = row;
    }
    view = next.subarray(0, written);
  }

  post({
    id,
    type: 'filtered',
    count: view.length,
    ms: performance.now() - started,
  });
};

const window_ = (offset: number, limit: number, id: number) => {
  const cols = columns;
  if (!cols || !view) return post({ id, type: 'window', rows: [], offset });
  const rows: DisplayRow[] = [];
  const end = Math.min(offset + limit, view.length);
  for (let i = Math.max(0, offset); i < end; i++) {
    rows.push(materialize(cols, view[i]));
  }
  post({ id, type: 'window', rows, offset });
};

self.onmessage = (event: MessageEvent<Request>) => {
  const request = event.data;
  if (request.type === 'load') {
    void load(request.rows, request.query ?? '', request.id);
  } else if (request.type === 'sort') {
    sort(request.terms, request.id);
  } else if (request.type === 'filter') {
    filter(request.text, request.statuses, request.workflowType, request.id);
  } else if (request.type === 'window') {
    window_(request.offset, request.limit, request.id);
  }
};
