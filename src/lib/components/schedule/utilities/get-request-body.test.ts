import { describe, expect, it } from 'vitest';

import { getRequestBody } from './get-request-body';
import { DEFAULT_CATCHUP_WINDOW, DEFAULT_TASK_TIMEOUT } from '../constants';
import { formScheduleSchema, type FormScheduleSchema } from '../schema/form';

import type { DescribeFullSchedule } from '$types/schedule';

const buildForm = (
  overrides: Record<string, unknown> = {},
): FormScheduleSchema =>
  formScheduleSchema.parse({
    name: 'my-schedule',
    workflowType: 'MyWorkflow',
    workflowId: 'my-workflow-id',
    taskQueue: 'my-task-queue',
    specs: [{ kind: 'cron', cronString: '0 12 * * *' }],
    timezoneName: 'UTC',
    startTime: '2026-01-01',
    catchupWindow: '60s',
    ...overrides,
  });

describe('getRequestBody', () => {
  it('maps core action fields', async () => {
    const body = await getRequestBody(buildForm());

    expect(body.schedule_id).toBe('my-schedule');
    expect(body.schedule.action!.startWorkflow.workflowId).toBe(
      'my-workflow-id',
    );
    expect(body.schedule.action!.startWorkflow.workflowType).toEqual({
      name: 'MyWorkflow',
    });
    expect(body.schedule.action!.startWorkflow.taskQueue).toEqual({
      name: 'my-task-queue',
    });
  });

  it('prefers an existing schedule id over the form name', async () => {
    const body = await getRequestBody(buildForm(), {
      schedule_id: 'existing-id',
      schedule: {},
    } as DescribeFullSchedule);

    expect(body.schedule_id).toBe('existing-id');
  });

  it('emits the cron string for cron specs', async () => {
    const body = await getRequestBody(buildForm());

    expect(body.schedule.spec!.cronString).toEqual(['0 12 * * *']);
  });

  it('drops invalid cron specs', async () => {
    const form = buildForm();
    form.specs = [{ ...form.specs[0], cronString: 'not a valid cron' }];

    const body = await getRequestBody(form);

    expect(body.schedule.spec!.cronString).toEqual([]);
  });

  it('maps interval specs', async () => {
    const body = await getRequestBody(
      buildForm({
        specs: [{ kind: 'interval', interval: { interval: '3600s' } }],
      }),
    );

    expect(body.schedule.spec!.interval).toEqual([
      { interval: '3600s', phase: '0s' },
    ]);
  });

  it('maps week and month specs to structured calendars', async () => {
    const body = await getRequestBody(
      buildForm({
        specs: [
          { kind: 'week', calendar: { dayOfWeek: [{ start: 1, end: 5 }] } },
        ],
      }),
    );

    expect(body.schedule.spec!.structuredCalendar).toHaveLength(1);
    expect(body.schedule.spec!.structuredCalendar![0].dayOfWeek).toEqual([
      { start: 1, end: 5 },
    ]);
  });

  it('defaults emptied second/minute/hour ranges to zero', async () => {
    const body = await getRequestBody(
      buildForm({
        specs: [
          {
            kind: 'week',
            calendar: {
              dayOfWeek: [{ start: 1, end: 5 }],
              second: [],
              minute: [],
              hour: [],
            },
          },
        ],
      }),
    );

    const [calendar] = body.schedule.spec!.structuredCalendar!;
    expect(calendar.second).toEqual([{ start: 0, end: 0, step: 1 }]);
    expect(calendar.minute).toEqual([{ start: 0, end: 0, step: 1 }]);
    expect(calendar.hour).toEqual([{ start: 0, end: 0, step: 1 }]);
  });

  it('anchors the start time to midnight of the timezone', async () => {
    const body = await getRequestBody(buildForm());

    expect(body.schedule.spec!.startTime).toBe('2026-01-01T00:00:00.000Z');
    expect(body.schedule.spec!.timezoneName).toBe('UTC');
  });

  it('omits the end time unless endKind is "on"', async () => {
    const body = await getRequestBody(buildForm());
    expect(body.schedule.spec!.endTime).toBeUndefined();
  });

  it('anchors the end time to end-of-day when endKind is "on"', async () => {
    const body = await getRequestBody(
      buildForm({ endKind: 'on', endTime: '2026-12-31' }),
    );

    expect(body.schedule.spec!.endTime).toBe('2026-12-31T23:59:59.000Z');
  });

  it('limits actions when endKind is "after"', async () => {
    const body = await getRequestBody(
      buildForm({ endKind: 'after', endAfterOccurrences: 5 }),
    );

    expect(body.schedule.state!.limitedActions).toBe(true);
    expect(body.schedule.state!.remainingActions).toBe(5);
  });

  it('does not limit actions otherwise', async () => {
    const body = await getRequestBody(buildForm());

    expect(body.schedule.state!.limitedActions).toBe(false);
    expect(body.schedule.state!.remainingActions).toBeUndefined();
  });

  it('emits jitter only when positive', async () => {
    const withJitter = await getRequestBody(buildForm({ jitter: 10 }));
    expect(withJitter.schedule.spec!.jitter).toBe('10s');

    const withoutJitter = await getRequestBody(buildForm({ jitter: 0 }));
    expect(withoutJitter.schedule.spec!.jitter).toBeUndefined();
  });

  it('falls back to defaults for emptied duration fields', async () => {
    const body = await getRequestBody(
      buildForm({ catchupWindow: '', taskTimeout: '' }),
    );

    expect(body.schedule.policies!.catchupWindow).toBe(DEFAULT_CATCHUP_WINDOW);
    expect(body.schedule.action!.startWorkflow.workflowTaskTimeout).toBe(
      DEFAULT_TASK_TIMEOUT,
    );
  });

  it('omits run and execution timeouts when zeroed (no timeout)', async () => {
    const { startWorkflow } = (await getRequestBody(buildForm())).schedule
      .action!;

    expect(startWorkflow.workflowTaskTimeout).toBe(DEFAULT_TASK_TIMEOUT);
    expect(startWorkflow.workflowRunTimeout).toBeUndefined();
    expect(startWorkflow.workflowExecutionTimeout).toBeUndefined();
  });

  it('clears a previously set timeout when the form value is zeroed', async () => {
    const describeFullSchedule = {
      schedule: {
        action: { startWorkflow: { workflowRunTimeout: '300s' } },
      },
    } as unknown as DescribeFullSchedule;

    const { startWorkflow } = (
      await getRequestBody(
        buildForm({ runTimeout: '0s' }),
        describeFullSchedule,
      )
    ).schedule.action!;

    expect(startWorkflow.workflowRunTimeout).toBeUndefined();
  });

  it('maps policy fields', async () => {
    const body = await getRequestBody(
      buildForm({ overlapPolicy: 'BufferOne', pauseOnFailure: true }),
    );

    expect(body.schedule.policies!.overlapPolicy).toBe('BufferOne');
    expect(body.schedule.policies!.pauseOnFailure).toBe(true);
  });

  it('reflects the paused state', async () => {
    const body = await getRequestBody(buildForm({ pauseSchedule: true }));
    expect(body.schedule.state!.paused).toBe(true);
  });

  describe('editing an existing schedule', () => {
    const describeWithSpec = (spec: Record<string, unknown>) =>
      ({
        schedule_id: 'existing-id',
        schedule: { spec },
      }) as unknown as DescribeFullSchedule;

    it('preserves exclusion calendars and timezone data', async () => {
      const body = await getRequestBody(
        buildForm(),
        describeWithSpec({
          excludeStructuredCalendar: [{ dayOfWeek: [{ start: 6 }] }],
          timezoneData: 'dGVzdA==',
        }),
      );

      expect(body.schedule.spec!.excludeStructuredCalendar).toEqual([
        { dayOfWeek: [{ start: 6 }] },
      ]);
      expect(body.schedule.spec!.timezoneData).toBe('dGVzdA==');
    });

    it('keeps the exact start time when its calendar date is unchanged', async () => {
      const body = await getRequestBody(
        buildForm(),
        describeWithSpec({ startTime: '2026-01-01T05:30:00.000Z' }),
      );

      expect(body.schedule.spec!.startTime).toBe('2026-01-01T05:30:00.000Z');
    });

    it('re-anchors the start time when the date is changed', async () => {
      const body = await getRequestBody(
        buildForm({ startTime: '2026-02-01' }),
        describeWithSpec({ startTime: '2026-01-01T05:30:00.000Z' }),
      );

      expect(body.schedule.spec!.startTime).toBe('2026-02-01T00:00:00.000Z');
    });

    it('does not invent a start time for a schedule without one', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const body = await getRequestBody(
        buildForm({ startTime: today }),
        describeWithSpec({}),
      );

      expect(body.schedule.spec!.startTime).toBeUndefined();
    });

    it('keeps the exact end time when its calendar date is unchanged', async () => {
      const body = await getRequestBody(
        buildForm({ endKind: 'on', endTime: '2026-12-31' }),
        describeWithSpec({ endTime: '2026-12-31T12:00:00.000Z' }),
      );

      expect(body.schedule.spec!.endTime).toBe('2026-12-31T12:00:00.000Z');
    });

    it('re-anchors the end time to end-of-day when the date is changed', async () => {
      const body = await getRequestBody(
        buildForm({ endKind: 'on', endTime: '2026-12-30' }),
        describeWithSpec({ endTime: '2026-12-31T12:00:00.000Z' }),
      );

      expect(body.schedule.spec!.endTime).toBe('2026-12-30T23:59:59.000Z');
    });
  });
});
