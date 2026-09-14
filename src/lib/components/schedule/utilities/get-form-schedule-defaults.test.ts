import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DescribeFullSchedule } from '$lib/types/schedule';

import {
  DEFAULT_CATCHUP_WINDOW,
  DEFAULT_EXECUTION_TIMEOUT,
  DEFAULT_RUN_TIMEOUT,
  DEFAULT_TASK_TIMEOUT,
} from '../constants';
import {
  getFormScheduleDefaults,
  parseOverlapPolicy,
} from './get-form-schedule-defaults';

const noAttributes = { searchAttributes: {}, customSearchAttributes: {} };

describe('parseOverlapPolicy', () => {
  it('passes through readable policy values', () => {
    expect(parseOverlapPolicy('BufferOne')).toBe('BufferOne');
    expect(parseOverlapPolicy('AllowAll')).toBe('AllowAll');
  });

  it('converts screaming-enum values', () => {
    expect(parseOverlapPolicy('SCHEDULE_OVERLAP_POLICY_BUFFER_ONE')).toBe(
      'BufferOne',
    );
  });

  it('falls back to Skip for missing or invalid values', () => {
    expect(parseOverlapPolicy(null)).toBe('Skip');
    expect(parseOverlapPolicy(undefined)).toBe('Skip');
    expect(parseOverlapPolicy('not-a-policy')).toBe('Skip');
  });
});

describe('getFormScheduleDefaults', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('without an existing schedule', () => {
    const defaults = getFormScheduleDefaults(null, noAttributes);

    it('uses empty identifiers', () => {
      expect(defaults.name).toBe('');
      expect(defaults.workflowType).toBe('');
      expect(defaults.taskQueue).toBe('');
    });

    it('enables input editing for new schedules', () => {
      expect(defaults.editInput).toBe(true);
    });

    it('seeds a single cron spec', () => {
      expect(defaults.specs).toHaveLength(1);
      expect(defaults.specs[0].kind).toBe('cron');
      expect(defaults.specs[0].cronString).toBe('');
    });

    it('uses the default policies and timeouts', () => {
      expect(defaults.timezoneName).toBe('UTC');
      expect(defaults.overlapPolicy).toBe('Skip');
      expect(defaults.endKind).toBe('never');
      expect(defaults.pauseOnFailure).toBe(false);
      expect(defaults.pauseSchedule).toBe(false);
      expect(defaults.catchupWindow).toBe(DEFAULT_CATCHUP_WINDOW);
      expect(defaults.taskTimeout).toBe(DEFAULT_TASK_TIMEOUT);
      expect(defaults.runTimeout).toBe(DEFAULT_RUN_TIMEOUT);
      expect(defaults.executionTimeout).toBe(DEFAULT_EXECUTION_TIMEOUT);
    });

    it('starts with no search attributes', () => {
      expect(defaults.searchAttributes).toEqual([]);
      expect(defaults.workflowSearchAttributes).toEqual([]);
    });
  });

  describe('with an existing schedule', () => {
    const describeFullSchedule = {
      schedule_id: 'sched-1',
      schedule: {
        action: {
          startWorkflow: {
            workflowType: { name: 'MyWorkflow' },
            workflowId: 'my-workflow-id',
            taskQueue: { name: 'my-task-queue' },
            workflowRunTimeout: '300s',
          },
        },
        spec: {
          timezoneName: 'America/New_York',
          startTime: '2026-01-01T05:00:00.000Z',
          interval: [{ interval: '3600s' }],
        },
        policies: {
          overlapPolicy: 'SCHEDULE_OVERLAP_POLICY_BUFFER_ONE',
          pauseOnFailure: true,
          catchupWindow: '600s',
        },
        state: {
          paused: true,
          limitedActions: true,
          // int64 fields arrive as strings from the HTTP API
          remainingActions: '3',
        },
      },
    } as unknown as DescribeFullSchedule;

    const defaults = getFormScheduleDefaults(
      describeFullSchedule,
      noAttributes,
    );

    it('maps the workflow action fields', () => {
      expect(defaults.name).toBe('sched-1');
      expect(defaults.workflowType).toBe('MyWorkflow');
      expect(defaults.workflowId).toBe('my-workflow-id');
      expect(defaults.taskQueue).toBe('my-task-queue');
    });

    it('disables input editing for existing schedules', () => {
      expect(defaults.editInput).toBe(false);
    });

    it('reads the spec timezone and start time', () => {
      expect(defaults.timezoneName).toBe('America/New_York');
      expect(defaults.startTime).toBe('2026-01-01');
    });

    it('loads the interval spec', () => {
      expect(defaults.specs).toHaveLength(1);
      expect(defaults.specs[0].kind).toBe('frozen');
      expect(defaults.specs[0].interval).toEqual({
        interval: '3600s',
        phase: '0s',
      });
    });

    it('parses the overlap policy and timeouts', () => {
      expect(defaults.overlapPolicy).toBe('BufferOne');
      expect(defaults.pauseOnFailure).toBe(true);
      expect(defaults.pauseSchedule).toBe(true);
      expect(defaults.catchupWindow).toBe('600s');
      expect(defaults.runTimeout).toBe('300s');
      expect(defaults.executionTimeout).toBe('');
    });

    it('derives the end condition from limited actions', () => {
      expect(defaults.endKind).toBe('after');
      expect(defaults.endAfterOccurrences).toBe(3);
    });
  });

  it('normalizes a stored 0s run/execution timeout to empty', () => {
    const defaults = getFormScheduleDefaults(
      {
        schedule: {
          action: {
            startWorkflow: {
              workflowRunTimeout: '0s',
              workflowExecutionTimeout: '0s',
            },
          },
        },
      } as unknown as DescribeFullSchedule,
      noAttributes,
    );

    expect(defaults.runTimeout).toBe('');
    expect(defaults.executionTimeout).toBe('');
  });

  it('prefills the end date with today in the schedule timezone', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T02:00:00.000Z'));

    const defaults = getFormScheduleDefaults(
      {
        schedule: {
          spec: { timezoneName: 'America/New_York' },
        },
      } as unknown as DescribeFullSchedule,
      noAttributes,
    );

    expect(defaults.endKind).toBe('never');
    expect(defaults.endTime).toBe('2026-06-09');
  });

  it('derives an "on" end condition from an end time', () => {
    const defaults = getFormScheduleDefaults(
      {
        schedule: {
          spec: {
            timezoneName: 'UTC',
            endTime: '2026-12-31T00:00:00.000Z',
          },
        },
      } as unknown as DescribeFullSchedule,
      noAttributes,
    );

    expect(defaults.endKind).toBe('on');
    expect(defaults.endTime).toBe('2026-12-31');
  });
});
