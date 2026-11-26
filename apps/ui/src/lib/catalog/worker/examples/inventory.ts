export type CorpusDisposition = 'keep' | 'defer' | 'dedupe' | 'omit';

export type CorpusInventoryEntry = {
  workflowName: string;
  sourcePath: string;
  disposition: CorpusDisposition;
  reason: string;
};

export const sharedWorkflowCorpusInventory = [
  {
    workflowName: 'hello',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Smallest activity-backed workflow and catalog smoke test.',
  },
  {
    workflowName: 'updateWorkflowSearchAttributes',
    sourcePath: 'canary/workflows.ts',
    disposition: 'defer',
    reason:
      'Requires a known custom Search Attribute setup before it is portable.',
  },
  {
    workflowName: 'parallelActivities',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Provides concurrent activity and overlapping event evidence.',
  },
  {
    workflowName: 'sequentialActivities',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Provides ordered activity evidence distinct from concurrency.',
  },
  {
    workflowName: 'longActivity',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason:
      'Exercises an activity that remains running long enough to inspect.',
  },
  {
    workflowName: 'timeoutWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Produces explicit activity timeout evidence.',
  },
  {
    workflowName: 'retryWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Produces deterministic failed attempts followed by success.',
  },
  {
    workflowName: 'signalWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Exercises signals and queries with bounded completion paths.',
  },
  {
    workflowName: 'heartbeatWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Produces activity heartbeat progress for inspection.',
  },
  {
    workflowName: 'scheduleWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason:
      'Exercises durable timers and is labeled as timer-driven, not a Schedule.',
  },
  {
    workflowName: 'highEventCountWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Produces a dense concurrent event history for UI coverage.',
  },
  {
    workflowName: 'childWorkflowTest',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Produces visible parent and child workflow relationships.',
  },
  {
    workflowName: 'resetWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'defer',
    reason:
      'The source reset activities simulate reset behavior instead of calling a real reset API.',
  },
  {
    workflowName: 'resetBaseWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'defer',
    reason: 'It is an internal companion to the deferred reset orchestration.',
  },
  {
    workflowName: 'sanityWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'dedupe',
    reason:
      'It aggregates workflows already exposed and verified individually by the catalog.',
  },
  {
    workflowName: 'localActivityWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Produces local activity marker evidence.',
  },
  {
    workflowName: 'patchWorkflow',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Produces patch markers for versioning inspection.',
  },
  {
    workflowName: 'signalCollector',
    sourcePath: 'canary/workflows.ts',
    disposition: 'keep',
    reason: 'Combines bounded signal collection with activity processing.',
  },
  {
    workflowName: 'getToolStatus',
    sourcePath: 'tooling/workflows.ts',
    disposition: 'omit',
    reason:
      'It depends on third-party status endpoints and does not provide a safe portable canary.',
  },
  {
    workflowName: 'developerDay',
    sourcePath: 'lifecycle/workflows.ts',
    disposition: 'omit',
    reason:
      'The synthetic narrative duplicates activity, timer, and retry coverage.',
  },
  {
    workflowName: 'sprintDay',
    sourcePath: 'lifecycle/workflows.ts',
    disposition: 'omit',
    reason:
      'It wraps the omitted developer-day narrative without new coverage.',
  },
  {
    workflowName: 'crunchTimeDay',
    sourcePath: 'lifecycle/workflows.ts',
    disposition: 'omit',
    reason:
      'It wraps the omitted developer-day narrative without new coverage.',
  },
] as const satisfies readonly CorpusInventoryEntry[];
