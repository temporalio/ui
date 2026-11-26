import { describe, expect, it } from 'vitest';

import type { ScheduleListEntry } from '$lib/types';
import type { DescribeFullSchedule } from '$lib/types/schedule';

import { resolveScheduledAction } from './resolve-scheduled-action';
import { resolveScheduledActionListEntry } from './resolve-scheduled-action-list-entry';

describe('resolveScheduledAction', () => {
  it('resolves a new schedule to the default action type', () => {
    expect(resolveScheduledAction(null)).toEqual({
      type: 'workflow',
      schedule: null,
    });
  });

  it('resolves a new schedule to the selected action type', () => {
    expect(resolveScheduledAction(null, 'workflow')).toEqual({
      type: 'workflow',
      schedule: null,
    });
  });

  it('resolves a schedule with a startWorkflow action as a workflow', () => {
    const schedule = {
      schedule: {
        action: { startWorkflow: { workflowType: { name: 'MyWorkflow' } } },
      },
    } as DescribeFullSchedule;

    expect(resolveScheduledAction(schedule)).toEqual({
      type: 'workflow',
      schedule,
    });
  });

  it('ignores the selected type for an existing schedule', () => {
    const schedule = {
      schedule: { action: { startWorkflow: {} } },
    } as DescribeFullSchedule;

    expect(resolveScheduledAction(schedule, 'workflow').schedule).toBe(
      schedule,
    );
  });

  it.each([
    ['no action', { schedule: {} }],
    ['an empty action', { schedule: { action: {} } }],
    ['a null startWorkflow', { schedule: { action: { startWorkflow: null } } }],
  ])('resolves a schedule with %s as unknown', (_, schedule) => {
    const describeFullSchedule = schedule as unknown as DescribeFullSchedule;

    expect(resolveScheduledAction(describeFullSchedule)).toEqual({
      type: 'unknown',
      schedule: describeFullSchedule,
    });
  });
});

describe('resolveScheduledActionListEntry', () => {
  it('resolves an entry with a workflow type as a workflow', () => {
    const schedule = {
      scheduleId: 'sched-1',
      info: { workflowType: { name: 'MyWorkflow' } },
    } as ScheduleListEntry;

    expect(resolveScheduledActionListEntry(schedule)).toEqual({
      type: 'workflow',
      schedule,
    });
  });

  it.each([
    ['no info', { scheduleId: 'sched-1' }],
    ['no workflow type', { scheduleId: 'sched-1', info: {} }],
  ])('resolves an entry with %s as unknown', (_, schedule) => {
    const listEntry = schedule as ScheduleListEntry;

    expect(resolveScheduledActionListEntry(listEntry)).toEqual({
      type: 'unknown',
      schedule: listEntry,
    });
  });
});
