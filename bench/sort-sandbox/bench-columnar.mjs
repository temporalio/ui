// Can we hold and sort 12M workflows client-side?
// Columnar typed arrays + radix/counting sort on an index permutation.

const N = Number(process.argv[2] ?? 12_000_000);
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(0) + ' MB';
const ms = (t) => t.toFixed(0) + 'ms';

const mulberry32 = (seed) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------- generate ----------
let t = performance.now();
const status = new Uint8Array(N); // 7 values
const typeIdx = new Uint8Array(N); // 8 values
const queueIdx = new Uint8Array(N); // 3 values
const startSec = new Uint32Array(N); // epoch seconds
const endSec = new Uint32Array(N); // 0 = null (Running)

const random = mulberry32(20260810);
const nowSec = Math.floor(Date.now() / 1000);
const WEEK = 7 * 24 * 3600;

for (let i = 0; i < N; i++) {
  const s = (random() * 7) | 0;
  status[i] = s;
  typeIdx[i] = (random() * 8) | 0;
  queueIdx[i] = (random() * 3) | 0;
  const start = nowSec - ((random() * WEEK) | 0);
  startSec[i] = start;
  endSec[i] = s === 0 ? 0 : start + ((random() * 7200) | 0);
}
const genTime = performance.now() - t;

const columnBytes =
  status.byteLength +
  typeIdx.byteLength +
  queueIdx.byteLength +
  startSec.byteLength +
  endSec.byteLength;

console.log(`rows:            ${N.toLocaleString()}`);
console.log(`generate:        ${ms(genTime)}`);
console.log(`column bytes:    ${mb(columnBytes)}`);
console.log(`process rss:     ${mb(process.memoryUsage().rss)}`);
console.log('');

// ---------- sorts ----------
// Both sorts are stable, so a multi-key sort is just successive passes
// applied from the least significant key to the most significant.

const scratch = new Uint32Array(N);
const counts = new Uint32Array(256);

const countingSortU8 = (idx, keys, desc) => {
  counts.fill(0);
  for (let i = 0; i < N; i++) counts[keys[idx[i]]]++;
  let total = 0;
  if (desc) {
    for (let v = 255; v >= 0; v--) {
      const c = counts[v];
      counts[v] = total;
      total += c;
    }
  } else {
    for (let v = 0; v < 256; v++) {
      const c = counts[v];
      counts[v] = total;
      total += c;
    }
  }
  for (let i = 0; i < N; i++) scratch[counts[keys[idx[i]]]++] = idx[i];
  idx.set(scratch);
};

const radixSortU32 = (idx, keys, desc) => {
  for (let shift = 0; shift < 32; shift += 8) {
    counts.fill(0);
    for (let i = 0; i < N; i++) {
      const k = desc ? ~keys[idx[i]] >>> 0 : keys[idx[i]];
      counts[(k >>> shift) & 255]++;
    }
    let total = 0;
    for (let v = 0; v < 256; v++) {
      const c = counts[v];
      counts[v] = total;
      total += c;
    }
    for (let i = 0; i < N; i++) {
      const id = idx[i];
      const k = desc ? ~keys[id] >>> 0 : keys[id];
      scratch[counts[(k >>> shift) & 255]++] = id;
    }
    idx.set(scratch);
  }
};

const freshIndex = () => {
  const idx = new Uint32Array(N);
  for (let i = 0; i < N; i++) idx[i] = i;
  return idx;
};

const time = (label, fn) => {
  const idx = freshIndex();
  const start = performance.now();
  fn(idx);
  const elapsed = performance.now() - start;
  console.log(`${label.padEnd(46)} ${ms(elapsed).padStart(8)}`);
  return idx;
};

const byStatus = time('sort by Status (counting, 1 pass)', (idx) =>
  countingSortU8(idx, status, false),
);
const byStart = time('sort by Start desc (radix, 4 passes)', (idx) =>
  radixSortU32(idx, startSec, true),
);
const byThree = time(
  'sort by Status, then Type, then Start desc (3 keys)',
  (idx) => {
    radixSortU32(idx, startSec, true); // least significant first
    countingSortU8(idx, typeIdx, false);
    countingSortU8(idx, status, false);
  },
);

// ---------- correctness ----------
const ordered = (idx, check) => {
  for (let i = 1; i < N; i++) if (!check(idx[i - 1], idx[i])) return false;
  return true;
};

console.log('');
console.log(
  'Status ordered:      ',
  ordered(byStatus, (a, b) => status[a] <= status[b]),
);
console.log(
  'Start desc ordered:  ',
  ordered(byStart, (a, b) => startSec[a] >= startSec[b]),
);
console.log(
  '3-key ordered:       ',
  ordered(byThree, (a, b) => {
    if (status[a] !== status[b]) return status[a] < status[b];
    if (typeIdx[a] !== typeIdx[b]) return typeIdx[a] < typeIdx[b];
    return startSec[a] >= startSec[b];
  }),
);
console.log(`peak rss:            ${mb(process.memoryUsage().rss)}`);
