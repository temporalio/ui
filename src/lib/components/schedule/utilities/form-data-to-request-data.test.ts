import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Schedule } from '$lib/types';
import { encodePayloads } from '$lib/utilities/encode-payload';

import {
  formDataToCreateScheduleRequest,
  formDataToEditScheduleRequest,
} from './form-data-to-request-data';
import type { ScheduleFormData } from '../schema/form-schema';

vi.mock('$lib/utilities/encode-payload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('$lib/utilities/encode-payload')>()),
  encodePayloads: vi.fn(async ({ input }: { input: string }) => [
    { metadata: { encoding: 'json/plain' }, data: input },
  ]),
}));

const baseFormData = (
  overrides: Partial<ScheduleFormData> = {},
): ScheduleFormData =>
  ({
    name: 'my-schedule',
    workflowType: 'MyWorkflow',
    workflowId: 'wf-id',
    taskQueue: 'my-task-queue',
    input: '',
    editInput: true,
    encoding: 'json/plain',
    messageType: '',
    specs: [{ type: 'cron', cronString: '0 12 * * *' }],
    timezoneName: 'UTC',
    startDate: '',
    endDateType: 'never',
    endDate: '',
    endAfterOccurrences: undefined,
    jitter: '0',
    keepOriginalWorkflowId: false,
    searchAttributes: [],
    workflowSearchAttributes: [],
    overlapPolicy: 'Skip',
    pauseOnFailure: false,
    pauseSchedule: false,
    catchupWindow: '',
    taskTimeout: '',
    runTimeout: '',
    executionTimeout: '',
    ...overrides,
  }) as ScheduleFormData;

beforeEach(() => {
  vi.mocked(encodePayloads).mockClear();
});

describe('formDataToCreateScheduleRequest', () => {
  it('maps the core workflow action fields and trims the name', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ name: '  my-schedule  ' }),
    );

    expect(body.schedule_id).toBe('my-schedule');
    const startWorkflow = body.schedule.action.startWorkflow;
    expect(startWorkflow.workflowId).toBe('wf-id');
    expect(startWorkflow.workflowType).toEqual({ name: 'MyWorkflow' });
    expect(startWorkflow.taskQueue).toEqual({ name: 'my-task-queue' });
  });

  it('leaves input null and skips encoding when there is no input', async () => {
    const body = await formDataToCreateScheduleRequest(baseFormData());

    expect(encodePayloads).not.toHaveBeenCalled();
    expect(body.schedule.action.startWorkflow.input).toBeNull();
  });

  it('encodes input into payloads when provided', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ input: '{"foo":"bar"}' }),
    );

    expect(encodePayloads).toHaveBeenCalledWith({
      input: '{"foo":"bar"}',
      encoding: 'json/plain',
      messageType: '',
    });
    expect(body.schedule.action.startWorkflow.input).toEqual({
      payloads: [
        { metadata: { encoding: 'json/plain' }, data: '{"foo":"bar"}' },
      ],
    });
  });

  it('builds a cron spec with the duplicated comment marker and trims whitespace', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ specs: [{ type: 'cron', cronString: '  0 12 * * *  ' }] }),
    );

    expect(body.schedule.spec.cronString).toEqual(['0 12 * * *#0 12 * * *']);
    expect(body.schedule.spec.calendar).toEqual([]);
    expect(body.schedule.spec.interval).toEqual([]);
    expect(body.schedule.spec.timezoneName).toBe('UTC');
  });

  it('drops a cron spec whose expression is empty', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ specs: [{ type: 'cron', cronString: '   ' }] }),
    );

    expect(body.schedule.spec.cronString).toEqual([]);
  });

  it('drops a cron spec whose expression is invalid', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ specs: [{ type: 'cron', cronString: 'not a cron' }] }),
    );

    expect(body.schedule.spec.cronString).toEqual([]);
  });

  it('builds an interval spec and defaults the phase to 0s', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ specs: [{ type: 'interval', interval: '300s' }] }),
    );

    expect(body.schedule.spec.interval).toEqual([
      { interval: '300s', phase: '0s' },
    ]);
  });

  it('builds a weekly calendar spec from sorted days of week', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({
        specs: [
          {
            type: 'week',
            daysOfWeek: ['5', '1', '3'],
            time: { hour: 9, minute: 30 },
          },
        ],
      }),
    );

    expect(body.schedule.spec.calendar).toEqual([
      {
        year: '*',
        month: '',
        dayOfMonth: '',
        dayOfWeek: '1,3,5',
        hour: '9',
        minute: '30',
        second: '',
      },
    ]);
  });

  it('builds a monthly calendar spec from sorted days and months', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({
        specs: [
          {
            type: 'month',
            daysOfMonth: ['15', '1'],
            months: ['6', '1'],
            time: { hour: 0, minute: 0 },
          },
        ],
      }),
    );

    expect(body.schedule.spec.calendar).toEqual([
      {
        year: '*',
        month: '1,6',
        dayOfMonth: '1,15',
        dayOfWeek: '',
        hour: '0',
        minute: '0',
        second: '',
      },
    ]);
  });

  it('serializes midnight (hour 0, minute 0) without collapsing to wildcards', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({
        specs: [
          {
            type: 'week',
            daysOfWeek: ['1'],
            time: { hour: 0, minute: 0 },
          },
        ],
      }),
    );

    expect(body.schedule.spec.calendar).toEqual([
      {
        year: '*',
        month: '',
        dayOfMonth: '',
        dayOfWeek: '1',
        hour: '0',
        minute: '0',
        second: '',
      },
    ]);
  });

  it('sets startTime, endTime and jitter from the form', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({
        startDate: '2026-01-01T00:00:00Z',
        endDateType: 'on',
        endDate: '2026-12-31T00:00:00Z',
        jitter: '60',
      }),
    );

    expect(body.schedule.spec.startTime).toBe('2026-01-01T00:00:00Z');
    expect(body.schedule.spec.endTime).toBe('2026-12-31T00:00:00Z');
    expect(body.schedule.spec.jitter).toBe('60s');
  });

  it('omits jitter when it is zero', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ jitter: '0' }),
    );

    expect(body.schedule.spec.jitter).toBeUndefined();
  });

  it('translates an "after N occurrences" end condition into limited actions', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ endDateType: 'after', endAfterOccurrences: 5 }),
    );

    expect(body.schedule.state).toMatchObject({
      limitedActions: true,
      remainingActions: 5,
    });
  });

  it('marks the schedule paused when pauseSchedule is set', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ pauseSchedule: true }),
    );

    expect(body.schedule.state.paused).toBe(true);
  });

  it('returns null search attributes when there are none', async () => {
    const body = await formDataToCreateScheduleRequest(baseFormData());

    expect(body.searchAttributes).toBeNull();
    expect(body.schedule.action.startWorkflow.searchAttributes).toBeNull();
  });

  it('encodes search attributes into indexed fields when present', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({
        searchAttributes: [
          { label: 'CustomKeywordField', value: 'hello', type: 'Keyword' },
        ],
      }),
    );

    expect(body.searchAttributes).not.toBeNull();
    expect(Object.keys(body.searchAttributes.indexedFields)).toContain(
      'CustomKeywordField',
    );
  });

  it('includes workflow timeouts only when provided', async () => {
    const body = await formDataToCreateScheduleRequest(
      baseFormData({ taskTimeout: '10s', executionTimeout: '600s' }),
    );

    const startWorkflow = body.schedule.action.startWorkflow;
    expect(startWorkflow.workflowTaskTimeout).toBe('10s');
    expect(startWorkflow.workflowExecutionTimeout).toBe('600s');
    expect(startWorkflow).not.toHaveProperty('workflowRunTimeout');
  });
});

describe('formDataToEditScheduleRequest', () => {
  const existingSchedule = () =>
    ({
      action: {
        startWorkflow: {
          workflowId: 'old-id',
          workflowType: { name: 'OldWorkflow' },
          taskQueue: { name: 'old-queue' },
          input: { payloads: [{ metadata: {}, data: 'old' }] },
        },
      },
      state: { paused: false },
    }) as unknown as Schedule;

  it('uses the provided scheduleId and overrides core fields', async () => {
    const body = await formDataToEditScheduleRequest(
      baseFormData({ name: 'unused' }),
      existingSchedule(),
      'real-id',
    );

    expect(body.schedule_id).toBe('real-id');
    expect(body.schedule.action.startWorkflow.workflowId).toBe('wf-id');
    expect(body.schedule.action.startWorkflow.workflowType).toEqual({
      name: 'MyWorkflow',
    });
  });

  it('preserves the existing input when editInput is false', async () => {
    const body = await formDataToEditScheduleRequest(
      baseFormData({ editInput: false, input: '{"new":true}' }),
      existingSchedule(),
      'real-id',
    );

    expect(encodePayloads).not.toHaveBeenCalled();
    expect(body.schedule.action.startWorkflow.input).toEqual({
      payloads: [{ metadata: {}, data: 'old' }],
    });
  });

  it('replaces the input when editInput is true', async () => {
    const body = await formDataToEditScheduleRequest(
      baseFormData({ editInput: true, input: '{"new":true}' }),
      existingSchedule(),
      'real-id',
    );

    expect(body.schedule.action.startWorkflow.input).toEqual({
      payloads: [
        { metadata: { encoding: 'json/plain' }, data: '{"new":true}' },
      ],
    });
  });

  it('clears limited actions when the end condition is not "after"', async () => {
    const body = await formDataToEditScheduleRequest(
      baseFormData({ endDateType: 'never' }),
      existingSchedule(),
      'real-id',
    );

    expect(body.schedule.state).toMatchObject({
      limitedActions: false,
      remainingActions: undefined,
      paused: false,
    });
  });

  it('encodes header fields without mutating the source schedule', async () => {
    const schedule = existingSchedule();
    schedule.action.startWorkflow.header = {
      fields: { greeting: 'hello' },
    } as Schedule['action']['startWorkflow']['header'];

    const body = await formDataToEditScheduleRequest(
      baseFormData(),
      schedule,
      'real-id',
    );

    expect(body.schedule.action.startWorkflow.header.fields.greeting).toEqual({
      metadata: { encoding: 'json/plain' },
      data: '"hello"',
    });
    // source schedule is untouched
    expect(schedule.action.startWorkflow.header.fields.greeting).toBe('hello');
  });
});
