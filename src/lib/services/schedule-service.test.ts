import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { DescribeFullSchedule } from '$lib/types/schedule';
import type { WorkflowExecution } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  fetchRecentScheduleRunStatuses,
  toRecentScheduleRuns,
  withLatestWorkflowStatuses,
} from './schedule-service';

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

const action = (
  workflowId: string,
  actualTime: string,
  startWorkflowStatus?: string,
) => ({
  actualTime,
  startWorkflowResult: { workflowId, runId: `${workflowId}-run` },
  startWorkflowStatus,
});

const scheduleWith = (actions: unknown[]) =>
  ({ info: { recentActions: actions } }) as unknown as DescribeFullSchedule;

const execution = (
  id: string,
  startTime: string,
  status: string,
  runId = `${id}-run`,
) => ({ id, runId, startTime, status }) as unknown as WorkflowExecution;

describe('toRecentScheduleRuns', () => {
  test('sorts by actual time descending and caps the list', () => {
    const schedule = scheduleWith([
      action('a', '2026-08-01T00:00:00Z'),
      action('c', '2026-08-03T00:00:00Z'),
      action('b', '2026-08-02T00:00:00Z'),
    ]);

    expect(
      toRecentScheduleRuns(schedule, 2).map((run) => run.workflowId),
    ).toEqual(['c', 'b']);
  });

  test('defaults to five runs', () => {
    const actions = Array.from({ length: 8 }, (_, index) =>
      action(`wf-${index}`, `2026-08-0${index + 1}T00:00:00Z`),
    );

    expect(toRecentScheduleRuns(scheduleWith(actions))).toHaveLength(5);
  });

  test('converts the recorded status to its readable form', () => {
    const schedule = scheduleWith([
      action('a', '2026-08-01T00:00:00Z', 'WORKFLOW_EXECUTION_STATUS_RUNNING'),
    ]);

    expect(toRecentScheduleRuns(schedule)[0].status).toBe('Running');
  });

  test('does not add visibility-derived fields to recorded runs', () => {
    const schedule = scheduleWith([
      action('a', '2026-08-01T00:00:00Z', 'WORKFLOW_EXECUTION_STATUS_RUNNING'),
    ]);

    const run = toRecentScheduleRuns(schedule)[0];
    expect(run).not.toHaveProperty('delayed');
    expect(run).not.toHaveProperty('taskFailure');
    expect(run).not.toHaveProperty('inVisibility');
  });

  test('does not mutate the schedule response', () => {
    const actions = [
      action('a', '2026-08-01T00:00:00Z'),
      action('c', '2026-08-03T00:00:00Z'),
    ];
    const schedule = scheduleWith(actions);

    toRecentScheduleRuns(schedule);

    expect(schedule.info.recentActions[0].startWorkflowResult.workflowId).toBe(
      'a',
    );
  });

  test('returns an empty list when the schedule has no recent actions', () => {
    expect(toRecentScheduleRuns({} as DescribeFullSchedule)).toEqual([]);
  });
});

describe('withLatestWorkflowStatuses', () => {
  const runs = toRecentScheduleRuns(
    scheduleWith([
      action('a', '2026-08-01T00:00:00Z', 'WORKFLOW_EXECUTION_STATUS_RUNNING'),
      action('b', '2026-08-02T00:00:00Z', 'WORKFLOW_EXECUTION_STATUS_RUNNING'),
    ]),
  );

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-06T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('derives delay flags from execution time', () => {
    const originalRuns = structuredClone(runs);
    const merged = withLatestWorkflowStatuses(runs, [
      {
        ...execution('a', '2026-08-01T00:00:00Z', 'Running'),
        executionTime: '2026-08-07T00:00:00Z',
      },
      {
        ...execution('b', '2026-08-02T00:00:00Z', 'Running'),
        executionTime: '2026-08-05T00:00:00Z',
      },
    ]);

    expect(merged.map((run) => run.delayed)).toEqual([false, true]);
    expect(runs).toEqual(originalRuns);
  });

  test.each(['category=WorkflowTaskFailed', 'category=WorkflowTaskTimedOut'])(
    'sets taskFailure for a running workflow reporting %s',
    (problem) => {
      const originalRuns = structuredClone(runs);
      const merged = withLatestWorkflowStatuses(runs, [
        {
          ...execution('a', '2026-08-01T00:00:00Z', 'Running'),
          searchAttributes: {
            indexedFields: { TemporalReportedProblems: [problem] },
          },
        },
      ]);

      expect(merged.find((run) => run.workflowId === 'a')?.taskFailure).toBe(
        true,
      );
      expect(runs).toEqual(originalRuns);
    },
  );

  test('does not mark completed workflows as task-failed', () => {
    const merged = withLatestWorkflowStatuses(runs, [
      {
        ...execution('a', '2026-08-01T00:00:00Z', 'Completed'),
        searchAttributes: {
          indexedFields: {
            TemporalReportedProblems: ['category=WorkflowTaskFailed'],
          },
        },
      },
    ]);

    expect(merged.find((run) => run.workflowId === 'a')?.taskFailure).toBe(
      false,
    );
  });

  test('derives both modifiers from the newest execution', () => {
    const merged = withLatestWorkflowStatuses(runs, [
      {
        ...execution('a', '2026-08-05T00:00:00Z', 'Running', 'a-run-2'),
        executionTime: '2026-08-07T00:00:00Z',
        searchAttributes: {
          indexedFields: {
            TemporalReportedProblems: ['category=WorkflowTaskFailed'],
          },
        },
      },
      execution('a', '2026-08-01T00:00:00Z', 'ContinuedAsNew', 'a-run-1'),
    ]);

    expect(merged.find((run) => run.workflowId === 'a')).toMatchObject({
      runId: 'a-run-2',
      delayed: true,
      taskFailure: true,
    });
  });

  test('replaces the recorded status with the live one', () => {
    const merged = withLatestWorkflowStatuses(runs, [
      execution('a', '2026-08-01T00:00:00Z', 'Terminated'),
      execution('b', '2026-08-02T00:00:00Z', 'Paused'),
    ]);

    expect(merged.map((run) => run.status)).toEqual(['Paused', 'Terminated']);
  });

  test('keeps the recorded status for runs visibility did not return', () => {
    const merged = withLatestWorkflowStatuses(runs, [
      execution('b', '2026-08-02T00:00:00Z', 'Completed'),
    ]);

    expect(merged.map((run) => run.status)).toEqual(['Completed', 'Running']);
  });

  test('marks only matched runs as present in visibility', () => {
    const merged = withLatestWorkflowStatuses(runs, [
      execution('b', '2026-08-02T00:00:00Z', 'Completed'),
    ]);

    expect(merged.map((run) => run.inVisibility)).toEqual([true, false]);
    expect(runs.every((run) => !('inVisibility' in run))).toBe(true);
  });

  test('uses the newest execution of a continue-as-new chain', () => {
    const merged = withLatestWorkflowStatuses(runs, [
      execution('a', '2026-08-01T00:00:00Z', 'ContinuedAsNew', 'a-run-1'),
      execution('a', '2026-08-05T00:00:00Z', 'Failed', 'a-run-3'),
      execution('a', '2026-08-03T00:00:00Z', 'ContinuedAsNew', 'a-run-2'),
    ]);

    expect(merged.find((run) => run.workflowId === 'a')).toMatchObject({
      status: 'Failed',
      runId: 'a-run-3',
      inVisibility: true,
    });
  });

  test('keeps the recorded run id when the execution has none', () => {
    const merged = withLatestWorkflowStatuses(runs, [
      execution('a', '2026-08-01T00:00:00Z', 'Completed', ''),
    ]);

    expect(merged.find((run) => run.workflowId === 'a')).toMatchObject({
      status: 'Completed',
      runId: 'a-run',
    });
  });

  test('defaults modifier and visibility flags when visibility returns nothing', () => {
    expect(withLatestWorkflowStatuses(runs, [])).toEqual(
      runs.map((run) => ({
        ...run,
        delayed: false,
        taskFailure: false,
        inVisibility: false,
      })),
    );
  });
});

describe('fetchRecentScheduleRunStatuses', () => {
  const twoRuns = toRecentScheduleRuns(
    scheduleWith([
      action('a', '2026-08-01T00:00:00Z', 'WORKFLOW_EXECUTION_STATUS_RUNNING'),
      action('b', '2026-08-02T00:00:00Z', 'WORKFLOW_EXECUTION_STATUS_RUNNING'),
    ]),
  );

  const queryFor = () =>
    vi.mocked(requestFromAPI).mock.calls[0][1]?.params as Record<
      string,
      string
    >;

  beforeEach(() => {
    vi.mocked(requestFromAPI).mockReset();
    vi.mocked(requestFromAPI).mockResolvedValue({ executions: [] });
  });

  test('bounds the query to the runs on screen and to one execution each', async () => {
    await fetchRecentScheduleRunStatuses({
      namespace: 'default',
      scheduleId: 'daily',
      runs: twoRuns,
    });

    expect(queryFor().query).toBe(
      'TemporalScheduledById="daily" AND WorkflowId in ("b", "a") AND ExecutionStatus != "ContinuedAsNew"',
    );
  });

  test('escapes quotes in workflow ids', async () => {
    await fetchRecentScheduleRunStatuses({
      namespace: 'default',
      scheduleId: 'daily',
      runs: toRecentScheduleRuns(
        scheduleWith([action('say "hi"', '2026-08-01T00:00:00Z')]),
      ),
    });

    expect(queryFor().query).toContain('WorkflowId in ("say \\"hi\\"")');
  });

  test('escapes backslashes in workflow ids', async () => {
    await fetchRecentScheduleRunStatuses({
      namespace: 'default',
      scheduleId: 'daily',
      runs: toRecentScheduleRuns(
        scheduleWith([action('back\\slash', '2026-08-01T00:00:00Z')]),
      ),
    });

    expect(queryFor().query).toContain('WorkflowId in ("back\\\\slash")');
  });

  test('escapes a trailing backslash so it cannot escape the closing quote', async () => {
    await fetchRecentScheduleRunStatuses({
      namespace: 'default',
      scheduleId: 'daily',
      runs: toRecentScheduleRuns(
        scheduleWith([action('trailing\\', '2026-08-01T00:00:00Z')]),
      ),
    });

    expect(queryFor().query).toContain('WorkflowId in ("trailing\\\\")');
  });

  test('does not call the API when there are no runs', async () => {
    const result = await fetchRecentScheduleRunStatuses({
      namespace: 'default',
      scheduleId: 'daily',
      runs: [],
    });

    expect(requestFromAPI).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
