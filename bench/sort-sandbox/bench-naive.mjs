// The approach the POC uses today: an array of plain objects with real
// string IDs, sorted with Array.prototype.sort and a JS comparator.

const N = Number(process.argv[2] ?? 1_000_000);
const mb = (b) => (b / 1024 / 1024).toFixed(0) + ' MB';
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
const STATUSES = [
  'Running',
  'Completed',
  'Failed',
  'TimedOut',
  'Canceled',
  'Terminated',
  'ContinuedAsNew',
];

const random = mulberry32(20260810);
const hex = (n) =>
  Array.from({ length: n }, () => '0123456789abcdef'[(random() * 16) | 0]).join(
    '',
  );

const before = process.memoryUsage().rss;
let t = performance.now();
const rows = new Array(N);
for (let i = 0; i < N; i++) {
  const type = TYPES[(random() * 8) | 0];
  const status = STATUSES[(random() * 7) | 0];
  const start = Date.now() - ((random() * 6.048e8) | 0);
  rows[i] = {
    status,
    workflowId: `wf-${hex(8)}`,
    runId: `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`,
    type,
    startTime: start,
    endTime: status === 'Running' ? null : start + ((random() * 7.2e6) | 0),
    taskQueue: QUEUES[(random() * 3) | 0],
  };
}
const genTime = performance.now() - t;
const after = process.memoryUsage().rss;

console.log(`rows:            ${N.toLocaleString()}`);
console.log(`generate:        ${ms(genTime)}`);
console.log(`rss delta:       ${mb(after - before)}`);
console.log(`bytes/row:       ${((after - before) / N).toFixed(0)} B`);
console.log('');

const compare3 = (a, b) => {
  if (a.status !== b.status) return a.status < b.status ? -1 : 1;
  if (a.type !== b.type) return a.type < b.type ? -1 : 1;
  return b.startTime - a.startTime;
};

t = performance.now();
rows.sort((a, b) => b.startTime - a.startTime);
console.log(
  `sort by Start desc (Array.sort)      ${ms(performance.now() - t).padStart(9)}`,
);

t = performance.now();
rows.sort(compare3);
console.log(
  `sort by 3 keys (Array.sort)          ${ms(performance.now() - t).padStart(9)}`,
);

t = performance.now();
rows.sort((a, b) => a.workflowId.localeCompare(b.workflowId));
console.log(
  `sort by Workflow ID (localeCompare)  ${ms(performance.now() - t).padStart(9)}`,
);

console.log(`peak rss:        ${mb(process.memoryUsage().rss)}`);
