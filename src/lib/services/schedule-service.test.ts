import { get } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { FormScheduleSchema } from '$lib/components/schedule/schema/form';
import {
  actionPending,
  confirmationModal,
  loading,
  openConfirmationModal,
  serverError,
  submitBackfillSchedule,
  submitCreateSchedule,
  submitDeleteSchedule,
  submitEditSchedule,
  submitPauseSchedule,
  submitTriggerImmediatelySchedule,
} from '$lib/stores/schedules';
import { toaster } from '$lib/stores/toaster';
import type {
  DescribeFullSchedule,
  ScheduleRequestBody,
} from '$lib/types/schedule';
import type { WorkflowExecution } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  backfillRequest,
  createSchedule,
  deleteSchedule,
  editSchedule,
  fetchRecentScheduleRunStatuses,
  pauseSchedule,
  toRecentScheduleRuns,
  triggerImmediately,
  unpauseSchedule,
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

describe('schedule mutations error handling', () => {
  const handleError = vi.fn();
  const forbiddenFetch = () =>
    Promise.resolve(
      new Response(JSON.stringify({ message: 'Request unauthorized.' }), {
        status: 403,
        statusText: 'Forbidden',
      }),
    );

  const validFormData: FormScheduleSchema = {
    name: 'daily',
    workflowType: 'run-regularly',
    workflowId: 'wf-1',
    taskQueue: 'default-tq',
    input: '',
    encoding: 'json/plain',
    messageType: '',
    editInput: false,
    startTime: '2026-08-01',
    endKind: 'never',
    endTime: '2026-08-01',
    endAfterOccurrences: 1,
    timezoneName: 'UTC',
    jitter: 0,
    specs: [
      {
        type: 'interval',
        interval: 60,
        intervalUnit: 'second(s)',
        offset: 0,
        offsetUnit: 'second(s)',
      },
    ],
    overlapPolicy: 'Skip',
    pauseOnFailure: false,
    pauseSchedule: false,
    catchupWindow: '31536000s',
    taskTimeout: '0s',
    runTimeout: '0s',
    executionTimeout: '0s',
    searchAttributes: [],
    workflowSearchAttributes: [],
  };

  beforeEach(async () => {
    const actual = await vi.importActual<
      typeof import('$lib/utilities/request-from-api')
    >('$lib/utilities/request-from-api');

    handleError.mockReset();
    serverError.set('');
    loading.set(false);
    actionPending.set(false);
    confirmationModal.set('none');
    toaster.toasts.set([]);

    vi.mocked(requestFromAPI).mockReset();
    vi.mocked(requestFromAPI).mockImplementation((endpoint, init = {}) =>
      actual.requestFromAPI(endpoint, {
        ...init,
        request: forbiddenFetch as typeof fetch,
        handleError,
        isBrowser: false,
      }),
    );
  });

  test('pauseSchedule rejects with NetworkError on 403 without calling handleError', async () => {
    await expect(
      pauseSchedule({
        namespace: 'default',
        scheduleId: 'daily',
        reason: 'maintenance',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('unpauseSchedule rejects with NetworkError on 403 without calling handleError', async () => {
    await expect(
      unpauseSchedule({
        namespace: 'default',
        scheduleId: 'daily',
        reason: 'resuming',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('triggerImmediately rejects with NetworkError on 403 without calling handleError', async () => {
    await expect(
      triggerImmediately({
        namespace: 'default',
        scheduleId: 'daily',
        overlapPolicy: 'Skip',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('backfillRequest rejects with NetworkError on 403 without calling handleError', async () => {
    await expect(
      backfillRequest({
        namespace: 'default',
        scheduleId: 'daily',
        overlapPolicy: 'Skip',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-01T01:00:00Z',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('deleteSchedule rejects with NetworkError on 403 without calling handleError', async () => {
    await expect(
      deleteSchedule({
        namespace: 'default',
        scheduleId: 'daily',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('createSchedule returns error on 403 without calling handleError', async () => {
    const result = await createSchedule({
      namespace: 'default',
      scheduleId: 'daily',
      body: {} as ScheduleRequestBody,
    });

    expect(result).toEqual({
      conflictToken: '',
      error: 'Request unauthorized.',
    });
    expect(handleError).not.toHaveBeenCalled();
    expect(vi.mocked(requestFromAPI).mock.calls[0][1]?.notifyOnError).toBe(
      false,
    );
  });

  test('editSchedule returns error on 403 without calling handleError', async () => {
    const result = await editSchedule({
      namespace: 'default',
      scheduleId: 'daily',
      body: {} as ScheduleRequestBody,
    });

    expect(result).toEqual({
      error: 'Request unauthorized.',
    });
    expect(handleError).not.toHaveBeenCalled();
    expect(vi.mocked(requestFromAPI).mock.calls[0][1]?.notifyOnError).toBe(
      false,
    );
  });

  test('submitPauseSchedule keeps pause modal open and sets pause error on 403', async () => {
    openConfirmationModal('pause');

    await submitPauseSchedule('maintenance', {
      namespace: 'default',
      scheduleId: 'daily',
      isPaused: false,
    });

    expect(get(confirmationModal)).toBe('pause');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      'There was an error pausing the schedule. Request unauthorized.',
    );
  });

  test('submitPauseSchedule keeps pause modal open and sets unpause error on 403', async () => {
    openConfirmationModal('pause');

    await submitPauseSchedule('resuming', {
      namespace: 'default',
      scheduleId: 'daily',
      isPaused: true,
    });

    expect(get(confirmationModal)).toBe('pause');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      'There was an error unpausing the schedule. Request unauthorized.',
    );
  });

  test('submitTriggerImmediatelySchedule keeps trigger modal open and sets trigger error on 403', async () => {
    openConfirmationModal('trigger');

    await submitTriggerImmediatelySchedule('Skip', {
      namespace: 'default',
      scheduleId: 'daily',
    });

    expect(get(confirmationModal)).toBe('trigger');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      'There was an error triggering the schedule. Request unauthorized.',
    );
  });

  test('submitBackfillSchedule keeps backfill modal open and sets backfill error on 403', async () => {
    openConfirmationModal('backfill');

    await submitBackfillSchedule(
      {
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-01T01:00:00Z',
        overlapPolicy: 'Skip',
      },
      {
        namespace: 'default',
        scheduleId: 'daily',
      },
    );

    expect(get(confirmationModal)).toBe('backfill');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      'There was an error backfilling the schedule. Request unauthorized.',
    );
  });

  test('submitDeleteSchedule keeps delete modal open and sets delete error on 403', async () => {
    openConfirmationModal('delete');

    await submitDeleteSchedule({
      namespace: 'default',
      scheduleId: 'daily',
    });

    expect(get(confirmationModal)).toBe('delete');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      'Cannot delete schedule. Request unauthorized.',
    );
  });

  test('submitCreateSchedule does not toggle loading, sets serverError, and pushes error toast on 403', async () => {
    const loadingStates: boolean[] = [];
    const unsubscribe = loading.subscribe((value) => loadingStates.push(value));

    await submitCreateSchedule(validFormData, { namespace: 'default' });
    unsubscribe();

    expect(loadingStates).toEqual([false]);
    expect(get(serverError)).toBe('Request unauthorized.');
    expect(get(toaster.toasts)).toEqual([
      expect.objectContaining({
        variant: 'error',
        message: 'Request unauthorized.',
      }),
    ]);
  });

  test('submitEditSchedule does not toggle loading, sets serverError, and pushes error toast on 403', async () => {
    const loadingStates: boolean[] = [];
    const unsubscribe = loading.subscribe((value) => loadingStates.push(value));

    await submitEditSchedule(
      validFormData,
      {
        schedule: { spec: {}, action: {}, policies: {}, state: {} },
      } as unknown as DescribeFullSchedule,
      {
        namespace: 'default',
        scheduleId: 'daily',
      },
    );
    unsubscribe();

    expect(loadingStates).toEqual([false]);
    expect(get(serverError)).toBe('Request unauthorized.');
    expect(get(toaster.toasts)).toEqual([
      expect.objectContaining({
        variant: 'error',
        message: 'Request unauthorized.',
      }),
    ]);
  });
});
