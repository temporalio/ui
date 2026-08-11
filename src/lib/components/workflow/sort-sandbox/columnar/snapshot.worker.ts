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

type Request =
  | { id: number; type: 'load'; rows: number; rowsPerSecond: number }
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

/**
 * Fills the store in chunks, yielding between them so progress can be reported
 * and the load can be paced to the throughput a sharded fetch actually
 * achieves. The wait is the honest part of this feature, not an artifact.
 */
const load = async (rows: number, rowsPerSecond: number, id: number) => {
  const cols = allocate(rows);
  columns = cols;
  const rowOrder = new Uint32Array(rows);
  order = rowOrder;
  scratch = new Uint32Array(rows);

  for (const [name] of STATUSES) intern(cols.statusNames, name);
  for (const name of WORKFLOW_TYPES) intern(cols.typeNames, name);
  for (const name of TASK_QUEUES) intern(cols.queueNames, name);

  const now = Date.now();
  const CHUNK = 50_000;
  const startedAt = performance.now();
  let written = 0;

  while (written < rows) {
    const limit = Math.min(written + CHUNK, rows);
    for (let i = written; i < limit; i++) {
      const h1 = hash32(i);
      const h2 = hash32(i ^ 0x9e3779b9);
      const h3 = hash32(i + 0x7f4a7c15);

      const typeIndex = h1 % WORKFLOW_TYPES.length;
      let roll = (h3 / 4294967296) * STATUS_TOTAL;
      let statusIndex = 0;
      for (let s = 0; s < STATUSES.length; s++) {
        roll -= STATUSES[s][1];
        if (roll <= 0) {
          statusIndex = s;
          break;
        }
      }

      const startTime = now - ((h1 >>> 2) % WINDOW_MS);
      cols.status[i] = statusIndex;
      cols.type[i] = typeIndex;
      cols.queue[i] = h2 % TASK_QUEUES.length;
      cols.start[i] = startTime;
      cols.end[i] =
        statusIndex === 0
          ? 0
          : Math.min(now, startTime + 1000 + (h2 % 7_200_000));

      writePacked(
        cols.workflowId,
        i,
        ID_WIDTH,
        `${PREFIXES[typeIndex]}-${hexOf(h1, 8)}${hexOf(h2, 4)}`,
      );
      writePacked(
        cols.runId,
        i,
        RUN_WIDTH,
        `${hexOf(h1, 8)}-${hexOf(h2, 4)}-4${hexOf(h2 >>> 4, 3)}-a${hexOf(h3, 3)}-${hexOf(h3, 8)}${hexOf(i, 4)}`,
      );

      rowOrder[i] = i;
    }
    written = limit;
    cols.count = written;

    // pace to the measured sharded-fetch throughput so the wait reflects what
    // pulling this many rows actually costs
    const targetMs = (written / rowsPerSecond) * 1000;
    const elapsed = performance.now() - startedAt;
    if (elapsed < targetMs) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(120, targetMs - elapsed)),
      );
    }

    post({
      id,
      type: 'progress',
      loaded: written,
      total: rows,
      elapsedMs: performance.now() - startedAt,
    });
  }

  view = rowOrder.slice();
  post({
    id,
    type: 'loaded',
    count: written,
    bytes: bytesUsed(cols),
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
    void load(request.rows, request.rowsPerSecond, request.id);
  } else if (request.type === 'sort') {
    sort(request.terms, request.id);
  } else if (request.type === 'filter') {
    filter(request.text, request.statuses, request.workflowType, request.id);
  } else if (request.type === 'window') {
    window_(request.offset, request.limit, request.id);
  }
};
