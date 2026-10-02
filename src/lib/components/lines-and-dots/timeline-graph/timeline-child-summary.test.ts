import { describe, expect, it } from 'vitest';

import type { TimelineWorkflowNode } from './recursive-timeline-model';
import { summarizeChildWorkflow } from './timeline-child-summary';

const group = (fields: Record<string, unknown>) => ({
  eventCount: 3,
  isPending: false,
  startTimeMs: 1_000,
  lastTimeMs: 1_400,
  ...fields,
});

const node = (): TimelineWorkflowNode =>
  ({
    key: 'dunning',
    namespace: 'default',
    workflowId: 'dunning-acct-1',
    firstRunId: 'run-1',
    workflow: { name: 'DunningWorkflow', status: 'Completed' },
    childrenByGroupKey: new Map(),
    depth: 1,
    runs: [
      {
        runId: 'run-1',
        status: 'ContinuedAsNew',
        startTimeMs: 1_000,
        endTimeMs: 2_000,
        active: false,
        groups: [
          {
            timelineKey: 'run-1:5',
            runId: 'run-1',
            group: group({
              displayName: 'sendDunningNotice',
              category: 'activity',
              finalClassification: 'Completed',
            }),
          },
        ],
      },
      {
        runId: 'run-2',
        status: 'Completed',
        startTimeMs: 2_000,
        endTimeMs: 5_000,
        active: false,
        groups: [
          {
            timelineKey: 'run-2:5',
            runId: 'run-2',
            group: group({
              displayName: 'chargeCard',
              category: 'activity',
              finalClassification: 'Completed',
              activityAttempt: 3,
            }),
          },
          {
            timelineKey: 'run-2:9',
            runId: 'run-2',
            group: group({
              displayName: 'suspendService',
              category: 'activity',
              finalClassification: 'Failed',
            }),
          },
          {
            timelineKey: 'run-2:12',
            runId: 'run-2',
            group: group({
              displayName: 'AuditWorkflow',
              category: 'child-workflow',
              finalClassification: 'Completed',
              childWorkflow: { workflowId: 'audit-1', runId: 'a1' },
            }),
          },
        ],
      },
    ],
  }) as unknown as TimelineWorkflowNode;

describe('summarizeChildWorkflow', () => {
  it('names the workflow and its latest run', () => {
    expect(summarizeChildWorkflow(node())).toMatchObject({
      workflowId: 'dunning-acct-1',
      workflowType: 'DunningWorkflow',
      runId: 'run-2',
      status: 'Completed',
      timing: { startTimeMs: 1_000, endTimeMs: 5_000 },
    });
  });

  it('counts what its activities did', () => {
    expect(summarizeChildWorkflow(node()).activities).toEqual({
      total: 3,
      completed: 2,
      failed: 1,
      retried: 1,
    });
  });

  it('counts the workflows started directly inside it', () => {
    expect(summarizeChildWorkflow(node()).childWorkflows).toBe(1);
  });

  it('lists what ran directly inside it, run by run', () => {
    const { runs } = summarizeChildWorkflow(node());
    expect(runs.map((run) => run.label)).toEqual(['Run 1 of 2', 'Run 2 of 2']);
    expect(
      runs[1].items.map((item) => [item.label, item.outcome, item.attempt]),
    ).toEqual([
      ['chargeCard', 'completed', 3],
      ['suspendService', 'failed', undefined],
      ['audit-1', 'completed', undefined],
    ]);
  });

  it('leaves a single run unlabelled', () => {
    const single = node();
    single.runs = single.runs.slice(1);
    expect(summarizeChildWorkflow(single).runs[0].label).toBeUndefined();
  });

  it('keeps the end open while a run is live', () => {
    const live = node();
    live.runs[1] = { ...live.runs[1], active: true };
    expect(summarizeChildWorkflow(live).timing?.endTimeMs).toBeUndefined();
  });
});
