import { timelineKitchenSinkLongRunning } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
import {
  recordLocalTimelineStep,
  recordTimelineStep,
  retryTimelineStep,
} from '../timeline-kitchen-sink/activity.js';

const input: RuntimeJsonDocument = {
  defaultValue: [100, 30, 5, 3],
  schema: {
    type: 'array',
    prefixItems: [
      { title: 'Total runs', type: 'integer', minimum: 2, maximum: 1000 },
      {
        title: 'Hold per run (seconds)',
        type: 'integer',
        minimum: 1,
        maximum: 3600,
      },
      { title: 'Batches per run', type: 'integer', minimum: 1, maximum: 20 },
      {
        title: 'Concurrent child branches per batch',
        type: 'integer',
        minimum: 1,
        maximum: 10,
      },
    ],
    items: false,
    minItems: 4,
    maxItems: 4,
  },
};

const startOptions: RuntimeJsonDocument = {
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
};

export const catalogExample: CatalogExampleDefinition = {
  id: 'timeline-kitchen-sink-long-running',
  title: 'Timeline kitchen sink: long-running workflow',
  description:
    'Creates a bounded, long-running chain with repeated batches of concurrent nested children, activities, retries, signals, timers, local markers, updates, and expected child failures.',
  capabilityTags: [
    'event-history',
    'child-workflows',
    'continue-as-new',
    'activities',
    'retries',
    'signals',
    'timers',
    'updates',
  ],
  expectedEvidence: [
    'Every root run starts concurrent child branches in each batch; each child starts a nested grandchild and exchanges signals with the parent.',
    'Each batch runs two parallel activities, including one that fails its first attempt and retries, plus a local activity marker and a canceled timer.',
    'Every run catches one expected child failure and holds before continuing as new; all child results and operations settle before the transition.',
    'The final run holds and completes without continuing as new. Updates are handled synchronously during every run, including its hold.',
  ],
  setupMarkdown:
    'Defaults are **100 total runs**, **30 seconds of hold per run**, **5 batches per run**, and **3 concurrent child branches per batch**. Holds alone take **50 minutes**; workflow and activity execution adds more time. The default chain has **99 continue-as-new transitions**, **1,500 children**, **1,500 nested grandchildren**, **100 expected failing children**, **1,000 regular activity executions** (including **500 first-attempt failures and retries**, or 1,500 attempts), **500 local activity markers**, and **500 canceled timers**. Workflows generate signals in both directions automatically. While any root run is holding, invoke `timelineKitchenSinkLongRunningUpdate` with a string argument to record update events and receive a synchronous acknowledgment. Increase the per-run hold for a wider update window. Stop the chain early by **canceling or terminating** the current root execution; cancellation propagates to outstanding children, while termination is immediate. Inputs are bounded: total runs 2–1,000, hold 1–3,600 seconds, batches 1–20, and branches 1–10. Large configurations create substantial server and worker load. Queries do not create history events, and this example does not generate every server-internal event type.',
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'timelineKitchenSinkLongRunning',
    workflow: timelineKitchenSinkLongRunning,
    activities: {
      recordTimelineStep,
      retryTimelineStep,
      recordLocalTimelineStep,
    },
  },
};
