import { describe, expect, it } from 'vitest';

import type { FullSchedule } from '$lib/types/schedule';

import { scheduleToFormData } from './request-data-to-form-data';
import {
  DEFAULT_CATCHUP_WINDOW,
  DEFAULT_EXECUTION_TIMEOUT,
  DEFAULT_RUN_TIMEOUT,
  DEFAULT_TASK_TIMEOUT,
} from '../constants';

const baseParams = {
  searchAttributes: {},
  customSearchAttributes: {},
  scheduleId: 'test-schedule',
};

const getValues = (schedule: FullSchedule | null) =>
  scheduleToFormData({ ...baseParams, schedule });

describe('scheduleToFormData defaults (creating)', () => {
  it('returns creation defaults when there is no schedule', () => {
    const values = getValues(null);

    expect(values.name).toBe('test-schedule');
    expect(values.editInput).toBe(true);
    expect(values.encoding).toBe('json/plain');
    expect(values.specs).toEqual([{ type: 'cron', cronString: '' }]);
    expect(values.timezoneName).toBe('UTC');
    expect(values.endDateType).toBe('never');
    expect(values.overlapPolicy).toBe('Skip');
    expect(values.pauseSchedule).toBe(false);
    expect(values.keepOriginalWorkflowId).toBe(false);
    expect(values.catchupWindow).toBe(DEFAULT_CATCHUP_WINDOW);
    expect(values.taskTimeout).toBe(DEFAULT_TASK_TIMEOUT);
    expect(values.runTimeout).toBe(DEFAULT_RUN_TIMEOUT);
    expect(values.executionTimeout).toBe(DEFAULT_EXECUTION_TIMEOUT);
    expect(values.searchAttributes).toEqual([]);
    expect(values.workflowSearchAttributes).toEqual([]);
  });
});

describe('scheduleToFormData action fields', () => {
  it('maps the startWorkflow fields and timeouts', () => {
    const schedule = {
      action: {
        startWorkflow: {
          workflowType: { name: 'MyWorkflow' },
          workflowId: 'wf-id',
          taskQueue: { name: 'my-queue' },
          workflowTaskTimeout: '15s',
          workflowRunTimeout: '60s',
          workflowExecutionTimeout: '900s',
        },
      },
    } as unknown as FullSchedule;

    const values = getValues(schedule);

    expect(values.workflowType).toBe('MyWorkflow');
    expect(values.workflowId).toBe('wf-id');
    expect(values.taskQueue).toBe('my-queue');
    expect(values.taskTimeout).toBe('15s');
    expect(values.runTimeout).toBe('60s');
    expect(values.executionTimeout).toBe('900s');
    expect(values.editInput).toBe(false);
  });

  it('reads timezone, startDate and jitter from the spec', () => {
    const schedule = {
      spec: {
        timezoneName: 'America/New_York',
        startTime: '2026-01-01T00:00:00Z',
        jitter: '60s',
        interval: [{ interval: '300s', phase: '0s' }],
      },
    } as unknown as FullSchedule;

    const values = getValues(schedule);

    expect(values.timezoneName).toBe('America/New_York');
    expect(values.startDate).toBe('2026-01-01T00:00:00Z');
    expect(values.jitter).toBe('60s');
  });
});

describe('scheduleToFormData overlap policy parsing', () => {
  it('maps proto enum names to the form value', () => {
    const schedule = {
      policies: { overlapPolicy: 'SCHEDULE_OVERLAP_POLICY_BUFFER_ONE' },
    } as unknown as FullSchedule;

    expect(getValues(schedule).overlapPolicy).toBe('BufferOne');
  });

  it('passes through short-form values', () => {
    const schedule = {
      policies: { overlapPolicy: 'AllowAll' },
    } as unknown as FullSchedule;

    expect(getValues(schedule).overlapPolicy).toBe('AllowAll');
  });

  it('falls back to Skip for unknown or missing values', () => {
    const schedule = {
      policies: { overlapPolicy: 'SOMETHING_ELSE' },
    } as unknown as FullSchedule;

    expect(getValues(schedule).overlapPolicy).toBe('Skip');
    expect(getValues({} as FullSchedule).overlapPolicy).toBe('Skip');
  });
});

describe('scheduleToFormData spec parsing', () => {
  it('parses a cron spec and strips the comment marker', () => {
    const schedule = {
      spec: { cronString: ['0 12 * * *#0 12 * * *'] },
    } as unknown as FullSchedule;

    const { specs } = getValues(schedule);

    expect(specs).toEqual([{ type: 'cron', cronString: '0 12 * * *' }]);
  });

  it('parses a weekly structuredCalendar (IRange[]) into a week spec', () => {
    const schedule = {
      spec: {
        structuredCalendar: [
          {
            dayOfWeek: [{ start: 1, end: 5, step: 1 }],
            hour: [{ start: 9, end: 9 }],
            minute: [{ start: 30, end: 30 }],
          },
        ],
      },
    } as unknown as FullSchedule;

    const { specs } = getValues(schedule);

    expect(specs).toHaveLength(1);
    expect(specs[0]).toEqual({
      type: 'week',
      daysOfWeek: ['1', '2', '3', '4', '5'],
      time: { hour: 9, minute: 30 },
    });
  });

  it('parses a monthly structuredCalendar (IRange[]) into a month spec', () => {
    const schedule = {
      spec: {
        structuredCalendar: [
          {
            dayOfMonth: [
              { start: 1, end: 1 },
              { start: 15, end: 15 },
            ],
            month: [{ start: 6, end: 6 }],
            hour: [{ start: 0, end: 0 }],
            minute: [{ start: 0, end: 0 }],
          },
        ],
      },
    } as unknown as FullSchedule;

    const { specs } = getValues(schedule);

    expect(specs).toHaveLength(1);
    expect(specs[0]).toEqual({
      type: 'month',
      daysOfMonth: ['1', '15'],
      months: ['6'],
      time: { hour: 0, minute: 0 },
    });
  });

  it('parses the deprecated string calendar form', () => {
    const schedule = {
      spec: {
        calendar: [
          {
            dayOfWeek: '1,3,5',
            hour: '8',
            minute: '0',
          },
        ],
      },
    } as unknown as FullSchedule;

    const { specs } = getValues(schedule);

    expect(specs[0]).toEqual({
      type: 'week',
      daysOfWeek: ['1', '3', '5'],
      time: { hour: 8, minute: 0 },
    });
  });

  it('parses an interval spec', () => {
    const schedule = {
      spec: { interval: [{ interval: '300s', phase: '0s' }] },
    } as unknown as FullSchedule;

    const { specs } = getValues(schedule);

    expect(specs).toEqual([
      { type: 'interval', interval: '300s', phase: '0s' },
    ]);
  });

  it('falls back to a default cron spec when none parse', () => {
    const schedule = { spec: {} } as unknown as FullSchedule;

    expect(getValues(schedule).specs).toEqual([
      { type: 'cron', cronString: '' },
    ]);
  });
});

describe('scheduleToFormData end condition parsing', () => {
  it('restores the "after N occurrences" end condition from limitedActions', () => {
    const schedule = {
      spec: { interval: [{ interval: '300s', phase: '0s' }] },
      state: { limitedActions: true, remainingActions: 5 },
    } as unknown as FullSchedule;

    const values = getValues(schedule);

    expect(values.endDateType).toBe('after');
    expect(values.endAfterOccurrences).toBe(5);
  });

  it('restores the "on" end condition from an end time', () => {
    const schedule = {
      spec: {
        endTime: '2026-12-31T00:00:00Z',
        interval: [{ interval: '300s', phase: '0s' }],
      },
      state: {},
    } as unknown as FullSchedule;

    const values = getValues(schedule);

    expect(values.endDateType).toBe('on');
    expect(values.endDate).toBe('2026-12-31T00:00:00Z');
    expect(values.endAfterOccurrences).toBeUndefined();
  });

  it('defaults end condition to never without an end time or limited actions', () => {
    const schedule = {
      spec: { interval: [{ interval: '300s', phase: '0s' }] },
      state: {},
    } as unknown as FullSchedule;

    const values = getValues(schedule);

    expect(values.endDateType).toBe('never');
    expect(values.endAfterOccurrences).toBeUndefined();
  });
});

describe('scheduleToFormData state parsing', () => {
  it('reads the paused state and policy flags', () => {
    const schedule = {
      state: { paused: true },
      policies: {
        pauseOnFailure: true,
        keepOriginalWorkflowId: true,
        catchupWindow: '120s',
      },
    } as unknown as FullSchedule;

    const values = getValues(schedule);

    expect(values.pauseSchedule).toBe(true);
    expect(values.pauseOnFailure).toBe(true);
    expect(values.keepOriginalWorkflowId).toBe(true);
    expect(values.catchupWindow).toBe('120s');
  });
});
