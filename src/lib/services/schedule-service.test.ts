import { get } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { formScheduleSchema } from '$lib/components/schedule/schema/form';
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
import * as payloadEncoding from '$lib/utilities/encode-payload';
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

describe.each([
  { status: 400, statusText: 'Bad Request' },
  { status: 403, statusText: 'Forbidden' },
  { status: 409, statusText: 'Conflict' },
  { status: 500, statusText: 'Internal Server Error' },
])('schedule mutations error handling ($status)', ({ status, statusText }) => {
  const handleError = vi.fn();
  const errorFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ message: 'Request unauthorized.' }), {
      status,
      statusText,
    });

  const validFormData = formScheduleSchema.parse({
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
    specs: [{ kind: 'interval', interval: { interval: '60s', phase: '0s' } }],
    overlapPolicy: 'Skip',
    pauseOnFailure: false,
    pauseSchedule: false,
    catchupWindow: '31536000s',
    taskTimeout: '0s',
    runTimeout: '0s',
    executionTimeout: '0s',
    searchAttributes: [],
    workflowSearchAttributes: [],
  });
  const schedule: DescribeFullSchedule = {
    schedule_id: 'daily',
    schedule: { spec: {}, action: {}, policies: {}, state: {} },
  };
  const body: ScheduleRequestBody = { schedule_id: 'daily', schedule: {} };

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
        request: errorFetch,
        handleError,
        isBrowser: false,
      }),
    );
  });

  test('pauseSchedule rejects with NetworkError without calling handleError', async () => {
    await expect(
      pauseSchedule({
        namespace: 'default',
        scheduleId: 'daily',
        reason: 'maintenance',
      }),
    ).rejects.toMatchObject({
      statusCode: status,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('unpauseSchedule rejects with NetworkError without calling handleError', async () => {
    await expect(
      unpauseSchedule({
        namespace: 'default',
        scheduleId: 'daily',
        reason: 'resuming',
      }),
    ).rejects.toMatchObject({
      statusCode: status,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('triggerImmediately rejects with NetworkError without calling handleError', async () => {
    await expect(
      triggerImmediately({
        namespace: 'default',
        scheduleId: 'daily',
        overlapPolicy: 'Skip',
      }),
    ).rejects.toMatchObject({
      statusCode: status,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('backfillRequest rejects with NetworkError without calling handleError', async () => {
    await expect(
      backfillRequest({
        namespace: 'default',
        scheduleId: 'daily',
        overlapPolicy: 'Skip',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-01T01:00:00Z',
      }),
    ).rejects.toMatchObject({
      statusCode: status,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('deleteSchedule rejects with NetworkError without calling handleError', async () => {
    await expect(
      deleteSchedule({
        namespace: 'default',
        scheduleId: 'daily',
      }),
    ).rejects.toMatchObject({
      statusCode: status,
      message: 'Request unauthorized.',
    });

    expect(handleError).not.toHaveBeenCalled();
  });

  test('createSchedule rejects with NetworkError without calling handleError', async () => {
    await expect(
      createSchedule({
        namespace: 'default',
        scheduleId: 'daily',
        body,
      }),
    ).rejects.toMatchObject({
      statusCode: status,
      message: 'Request unauthorized.',
    });
    expect(handleError).not.toHaveBeenCalled();
    expect(vi.mocked(requestFromAPI).mock.calls[0][1]?.notifyOnError).toBe(
      false,
    );
  });

  test('editSchedule rejects with NetworkError without calling handleError', async () => {
    await expect(
      editSchedule({
        namespace: 'default',
        scheduleId: 'daily',
        body,
      }),
    ).rejects.toMatchObject({
      statusCode: status,
      message: 'Request unauthorized.',
    });
    expect(handleError).not.toHaveBeenCalled();
    expect(vi.mocked(requestFromAPI).mock.calls[0][1]?.notifyOnError).toBe(
      false,
    );
  });

  test('submitPauseSchedule keeps pause modal open and sets pause error', async () => {
    openConfirmationModal('pause');

    await submitPauseSchedule('maintenance', {
      namespace: 'default',
      scheduleId: 'daily',
      isPaused: false,
    });

    expect(get(confirmationModal)).toBe('pause');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      `There was an error pausing the schedule. ${status}: Request unauthorized.`,
    );
  });

  test('submitPauseSchedule keeps pause modal open and sets unpause error', async () => {
    openConfirmationModal('pause');

    await submitPauseSchedule('resuming', {
      namespace: 'default',
      scheduleId: 'daily',
      isPaused: true,
    });

    expect(get(confirmationModal)).toBe('pause');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      `There was an error unpausing the schedule. ${status}: Request unauthorized.`,
    );
  });

  test('submitTriggerImmediatelySchedule keeps trigger modal open and sets trigger error', async () => {
    openConfirmationModal('trigger');

    await submitTriggerImmediatelySchedule('Skip', {
      namespace: 'default',
      scheduleId: 'daily',
    });

    expect(get(confirmationModal)).toBe('trigger');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      `There was an error triggering the schedule. ${status}: Request unauthorized.`,
    );
  });

  test('submitBackfillSchedule keeps backfill modal open and sets backfill error', async () => {
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
      `There was an error backfilling the schedule. ${status}: Request unauthorized.`,
    );
  });

  test('submitDeleteSchedule keeps delete modal open and sets delete error', async () => {
    openConfirmationModal('delete');

    await submitDeleteSchedule({
      namespace: 'default',
      scheduleId: 'daily',
    });

    expect(get(confirmationModal)).toBe('delete');
    expect(get(actionPending)).toBe(false);
    expect(get(serverError)).toBe(
      `Cannot delete schedule. ${status}: Request unauthorized.`,
    );
  });

  test('submitCreateSchedule does not toggle loading, sets serverError, and pushes error toast', async () => {
    const loadingStates: boolean[] = [];
    const unsubscribe = loading.subscribe((value) => loadingStates.push(value));

    await submitCreateSchedule(validFormData, { namespace: 'default' });
    unsubscribe();

    expect(loadingStates).toEqual([false]);
    expect(get(serverError)).toBe(
      `Error creating schedule: ${status}: Request unauthorized.`,
    );
    expect(get(toaster.toasts)).toEqual([
      expect.objectContaining({
        variant: 'error',
        message: `Error creating schedule: ${status}: Request unauthorized.`,
      }),
    ]);
  });

  test('submitEditSchedule does not toggle loading, sets serverError, and pushes error toast', async () => {
    const loadingStates: boolean[] = [];
    const unsubscribe = loading.subscribe((value) => loadingStates.push(value));

    await submitEditSchedule(validFormData, schedule, {
      namespace: 'default',
      scheduleId: 'daily',
    });
    unsubscribe();

    expect(loadingStates).toEqual([false]);
    expect(get(serverError)).toBe(
      `Error editing schedule: ${status}: Request unauthorized.`,
    );
    expect(get(toaster.toasts)).toEqual([
      expect.objectContaining({
        variant: 'error',
        message: `Error editing schedule: ${status}: Request unauthorized.`,
      }),
    ]);
  });
});

describe('schedule mutation thrown errors', () => {
  const context = { namespace: 'default', scheduleId: 'daily' };
  const body: ScheduleRequestBody = { schedule_id: 'daily', schedule: {} };
  const schedule: DescribeFullSchedule = { schedule_id: 'daily', schedule: {} };
  const formData = formScheduleSchema.parse({
    name: 'daily',
    workflowType: 'run-regularly',
    workflowId: 'wf-1',
    taskQueue: 'default-tq',
    specs: [{ kind: 'interval', interval: { interval: '60s' } }],
  });
  const handleError = vi.fn();
  const request = vi.fn<typeof fetch>();
  const services = [
    { name: 'create', run: () => createSchedule({ ...context, body }) },
    { name: 'edit', run: () => editSchedule({ ...context, body }) },
    { name: 'delete', run: () => deleteSchedule(context) },
    {
      name: 'pause',
      run: () => pauseSchedule({ ...context, reason: 'maintenance' }),
    },
    {
      name: 'unpause',
      run: () => unpauseSchedule({ ...context, reason: 'resuming' }),
    },
    {
      name: 'trigger',
      run: () => triggerImmediately({ ...context, overlapPolicy: 'Skip' }),
    },
    {
      name: 'backfill',
      run: () =>
        backfillRequest({
          ...context,
          overlapPolicy: 'Skip',
          startTime: '2026-08-01T00:00:00Z',
          endTime: '2026-08-02T00:00:00Z',
        }),
    },
  ];
  const formSubmitters = [
    {
      name: 'create',
      prefix: 'Error creating schedule: ',
      run: (data = formData) => submitCreateSchedule(data, context),
    },
    {
      name: 'edit',
      prefix: 'Error editing schedule: ',
      run: (data = formData) => submitEditSchedule(data, schedule, context),
    },
  ];
  const modalSubmitters: {
    name: string;
    modal: Parameters<typeof openConfirmationModal>[0];
    prefix: string;
    run: () => Promise<void>;
  }[] = [
    {
      name: 'delete',
      modal: 'delete',
      prefix: 'Cannot delete schedule. ',
      run: () => submitDeleteSchedule(context),
    },
    {
      name: 'pause',
      modal: 'pause',
      prefix: 'There was an error pausing the schedule. ',
      run: () =>
        submitPauseSchedule('maintenance', { ...context, isPaused: false }),
    },
    {
      name: 'unpause',
      modal: 'pause',
      prefix: 'There was an error unpausing the schedule. ',
      run: () =>
        submitPauseSchedule('resuming', { ...context, isPaused: true }),
    },
    {
      name: 'trigger',
      modal: 'trigger',
      prefix: 'There was an error triggering the schedule. ',
      run: () => submitTriggerImmediatelySchedule('Skip', context),
    },
    {
      name: 'backfill',
      modal: 'backfill',
      prefix: 'There was an error backfilling the schedule. ',
      run: () =>
        submitBackfillSchedule(
          {
            startTime: '2026-08-01T00:00:00Z',
            endTime: '2026-08-02T00:00:00Z',
            overlapPolicy: 'Skip',
          },
          context,
        ),
    },
  ];

  beforeEach(async () => {
    const actual = await vi.importActual<
      typeof import('$lib/utilities/request-from-api')
    >('$lib/utilities/request-from-api');
    request.mockReset();
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
        request,
        handleError,
        isBrowser: false,
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.each([
    {
      name: 'network rejection',
      setup: () => request.mockRejectedValue(new TypeError('Failed to fetch')),
      errorType: TypeError,
      message: 'Failed to fetch',
    },
    {
      name: 'invalid JSON response',
      setup: () =>
        request.mockImplementation(
          async () => new Response('not json', { status: 502 }),
        ),
      errorType: SyntaxError,
      message: 'Unexpected token',
    },
  ])('$name', ({ setup, errorType, message }) => {
    beforeEach(() => {
      setup();
    });

    test.each(services)(
      '$name propagates the error without global handling',
      async ({ run }) => {
        await expect(run()).rejects.toBeInstanceOf(errorType);
        expect(handleError).not.toHaveBeenCalled();
        expect(request).toHaveBeenCalledTimes(1);
      },
    );

    test.each(formSubmitters)(
      '$name preserves form loading state and reports the error inline and in a toast',
      async ({ prefix, run }) => {
        const loadingStates: boolean[] = [];
        const unsubscribe = loading.subscribe((value) =>
          loadingStates.push(value),
        );
        try {
          await run();
          expect(loadingStates).toEqual([false]);
          expect(get(serverError)).toContain(prefix);
          expect(get(serverError)).toContain(message);
          expect(get(toaster.toasts)).toEqual([
            expect.objectContaining({
              variant: 'error',
              message: get(serverError),
            }),
          ]);
          expect(handleError).not.toHaveBeenCalled();
        } finally {
          unsubscribe();
        }
      },
    );

    test.each(modalSubmitters)(
      '$name keeps its modal open and allows retry',
      async ({ modal, prefix, run }) => {
        openConfirmationModal(modal);
        await run();
        expect(get(confirmationModal)).toBe(modal);
        expect(get(actionPending)).toBe(false);
        expect(get(serverError)).toContain(prefix);
        expect(get(serverError)).toContain(message);
        expect(get(toaster.toasts)).toEqual([]);
        expect(handleError).not.toHaveBeenCalled();
        expect(request).toHaveBeenCalledTimes(1);
      },
    );
  });

  test.each([
    {
      name: 'native Error',
      error: new Error('Native error'),
      message: 'Native error',
    },
    {
      name: 'plain API error',
      error: { message: 'API error' },
      message: 'API error',
    },
    {
      name: 'thrown string',
      error: 'String error',
      message: 'An unknown error occurred.',
    },
    {
      name: 'empty message',
      error: { message: '' },
      message: 'An unknown error occurred.',
    },
    {
      name: 'whitespace message',
      error: { message: ' \t ' },
      message: 'An unknown error occurred.',
    },
    {
      name: 'non-string message',
      error: { message: 123 },
      message: 'An unknown error occurred.',
    },
    {
      name: 'null message',
      error: { message: null },
      message: 'An unknown error occurred.',
    },
    {
      name: 'undefined message',
      error: { message: undefined },
      message: 'An unknown error occurred.',
    },
    {
      name: 'missing message',
      error: {},
      message: 'An unknown error occurred.',
    },
    { name: 'null', error: null, message: 'An unknown error occurred.' },
    {
      name: 'undefined',
      error: undefined,
      message: 'An unknown error occurred.',
    },
    { name: 'empty string', error: '', message: 'An unknown error occurred.' },
    {
      name: 'whitespace string',
      error: ' \n ',
      message: 'An unknown error occurred.',
    },
    { name: 'number', error: 123, message: 'An unknown error occurred.' },
    { name: 'boolean', error: false, message: 'An unknown error occurred.' },
  ])('formats $name safely in a modal error', async ({ error, message }) => {
    vi.mocked(requestFromAPI).mockRejectedValueOnce(error);
    openConfirmationModal('delete');
    await submitDeleteSchedule(context);
    expect(get(serverError)).toBe(`Cannot delete schedule. ${message}`);
    expect(get(confirmationModal)).toBe('delete');
    expect(get(actionPending)).toBe(false);
  });

  describe.each(formSubmitters)('$name form errors', ({ prefix, run }) => {
    test('clears the previous API error before retrying and reports the new failure', async () => {
      vi.mocked(requestFromAPI)
        .mockRejectedValueOnce({ message: 'First failure' })
        .mockImplementationOnce(async () => {
          expect(get(serverError)).toBe('');
          expect(get(loading)).toBe(false);
          throw new Error('Retry failure');
        });
      await run();
      expect(get(serverError)).toBe(`${prefix}First failure`);
      await run();
      expect(get(serverError)).toBe(`${prefix}Retry failure`);
      expect(get(toaster.toasts)).toHaveLength(2);
    });

    test.each([
      {
        name: 'encoder error',
        error: new Error('Codec unavailable'),
        message: 'Codec unavailable',
      },
      {
        name: 'encoder string rejection',
        error: 'Codec unavailable',
        message: 'An unknown error occurred.',
      },
      {
        name: 'unrecognized encoder rejection',
        error: {},
        message: 'An unknown error occurred.',
      },
    ])(
      'reports $name without sending a mutation',
      async ({ error, message }) => {
        vi.spyOn(payloadEncoding, 'encodePayloads').mockRejectedValueOnce(
          error,
        );
        const inputForm = { ...formData, editInput: true, input: '{}' };
        await run(inputForm);
        const expectedMessage = `Codec Server failed to encode: ${message}`;
        expect(get(serverError)).toBe(expectedMessage);
        expect(get(toaster.toasts)).toEqual([
          expect.objectContaining({
            variant: 'error',
            message: expectedMessage,
          }),
        ]);
        expect(get(loading)).toBe(false);
        expect(requestFromAPI).not.toHaveBeenCalled();
      },
    );
  });
});
