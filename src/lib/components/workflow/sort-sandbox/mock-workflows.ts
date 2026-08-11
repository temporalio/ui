/**
 * POC only. Deterministic fake workflows for the sort sandbox drawer so the
 * concept can be demoed without a running cluster. Nothing here talks to the
 * visibility API.
 */

export type SandboxStatus =
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'TimedOut'
  | 'Canceled'
  | 'Terminated'
  | 'ContinuedAsNew';

export type SandboxWorkflow = {
  status: SandboxStatus;
  workflowId: string;
  runId: string;
  type: string;
  startTime: number;
  endTime: number | null;
  taskQueue: string;
};

export const TOTAL_MATCHING = 12347;
export const PAGE_SIZE = 500;
export const PAGE_COUNT = Math.ceil(TOTAL_MATCHING / PAGE_SIZE);

/**
 * Deliberately not fast. The wait is what teaches "these rows came down to my
 * browser" — collapsing it into a flash would undo the point of the drawer.
 */
export const PAGE_DELAY_MS = 190;

export const WORKFLOW_TYPES = [
  'OrderFulfillmentWorkflow',
  'PaymentProcessingWorkflow',
  'UserOnboardingWorkflow',
  'InventorySyncWorkflow',
  'EmailNotificationWorkflow',
  'DataExportWorkflow',
  'SubscriptionRenewalWorkflow',
  'FraudReviewWorkflow',
];

export const TASK_QUEUES = ['default', 'payments-tq', 'batch-processing'];

const STATUS_WEIGHTS: [SandboxStatus, number][] = [
  ['Running', 34],
  ['Completed', 29],
  ['Failed', 14],
  ['TimedOut', 8],
  ['Canceled', 6],
  ['Terminated', 5],
  ['ContinuedAsNew', 4],
];

const STATUS_WEIGHT_TOTAL = STATUS_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);

const SEED = 20260810;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const toWorkflowIdPrefix = (type: string) =>
  type
    .replace(/Workflow$/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

let cachedWorkflows: SandboxWorkflow[] | null = null;
let cachedPageTokens: string[] | null = null;

const generate = () => {
  const random = mulberry32(SEED);
  const hex = (length: number) =>
    Array.from(
      { length },
      () => '0123456789abcdef'[Math.floor(random() * 16)],
    ).join('');

  const pickStatus = (): SandboxStatus => {
    let roll = random() * STATUS_WEIGHT_TOTAL;
    for (const [status, weight] of STATUS_WEIGHTS) {
      roll -= weight;
      if (roll <= 0) return status;
    }
    return 'Running';
  };

  const now = Date.now();
  const workflows: SandboxWorkflow[] = new Array(TOTAL_MATCHING);

  for (let i = 0; i < TOTAL_MATCHING; i++) {
    const type = WORKFLOW_TYPES[Math.floor(random() * WORKFLOW_TYPES.length)];
    const status = pickStatus();
    const startTime = now - Math.floor(random() * WEEK_MS);
    // squared roll so most runs are short and a few are long
    const duration =
      1000 + Math.floor(random() * random() * 2 * 60 * 60 * 1000);

    workflows[i] = {
      status,
      workflowId: `${toWorkflowIdPrefix(type)}-${hex(8)}`,
      runId: `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`,
      type,
      startTime,
      endTime:
        status === 'Running' ? null : Math.min(now, startTime + duration),
      taskQueue: TASK_QUEUES[Math.floor(random() * TASK_QUEUES.length)],
    };
  }

  // The visibility store's default ordering.
  workflows.sort((a, b) => b.startTime - a.startTime);

  cachedWorkflows = workflows;
  cachedPageTokens = Array.from({ length: PAGE_COUNT }, () => `ey${hex(14)}`);

  return { workflows: cachedWorkflows, tokens: cachedPageTokens };
};

export const getMockWorkflows = (): SandboxWorkflow[] =>
  cachedWorkflows ?? generate().workflows;

export const getMockPageTokens = (): string[] =>
  cachedPageTokens ?? generate().tokens;
