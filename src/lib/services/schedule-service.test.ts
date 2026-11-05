import { get } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { formWorkflowDetailsSchema } from '$lib/components/schedule/scheduled-action-types/workflow/schema';
import { formScheduleSchema } from '$lib/components/schedule/schema/form';
import type { ScheduleFormData } from '$lib/components/schedule/types';
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
import * as payloadEncoding from '$lib/utilities/encode-payload';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  backfillRequest,
  createSchedule,
  deleteSchedule,
  editSchedule,
  pauseSchedule,
  triggerImmediately,
  unpauseSchedule,
} from './schedule-service';

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

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

  const validFormData: ScheduleFormData = {
    schedule: formScheduleSchema.parse({
      name: 'daily',
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
      searchAttributes: [],
    }),
    action: {
      type: 'workflow',
      details: formWorkflowDetailsSchema.parse({
        workflowType: 'run-regularly',
        workflowId: 'wf-1',
        taskQueue: 'default-tq',
        input: '',
        encoding: 'json/plain',
        messageType: '',
        editInput: false,
        taskTimeout: '0s',
        runTimeout: '0s',
        executionTimeout: '0s',
        workflowSearchAttributes: [],
      }),
    },
  };
  const schedule: DescribeFullSchedule = {
    schedule_id: 'daily',
    schedule: {
      spec: {},
      action: { startWorkflow: {} },
      policies: {},
      state: {},
    },
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
  const schedule: DescribeFullSchedule = {
    schedule_id: 'daily',
    schedule: { action: { startWorkflow: {} } },
  };
  const formData: ScheduleFormData = {
    schedule: formScheduleSchema.parse({
      name: 'daily',
      specs: [{ kind: 'interval', interval: { interval: '60s' } }],
    }),
    action: {
      type: 'workflow',
      details: formWorkflowDetailsSchema.parse({
        workflowType: 'run-regularly',
        workflowId: 'wf-1',
        taskQueue: 'default-tq',
      }),
    },
  };
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
        const inputForm: ScheduleFormData = {
          ...formData,
          action: {
            ...formData.action,
            details: {
              ...formData.action.details,
              editInput: true,
              input: '{}',
            },
          },
        };
        await run(inputForm);
        const expectedMessage = `${prefix}Codec Server failed to encode: ${message}`;
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
