import { describe, expect, it } from 'vitest';

import type { ActivityExecutionListInfo } from '$lib/types/activity-execution';

import { getActivityColumnValue } from './column-search-attributes';

const activity = {
  activityId: 'my-activity',
  runId: 'my-run',
  activityType: { name: 'MyActivityType' },
  taskQueue: 'my-task-queue',
  status: 'Completed',
  scheduleTime: '2024-01-02T03:04:05Z',
  closeTime: '2024-01-02T03:09:15.5Z',
  executionDuration: '310.5s',
  stateTransitionCount: '4',
  searchAttributes: {
    indexedFields: {
      CustomKeywordField: 'my-keyword',
      CustomIntField: 42,
    },
  },
} as unknown as ActivityExecutionListInfo;

describe('getActivityColumnValue', () => {
  it('reads the activity fields a mapped column filters on', () => {
    expect(getActivityColumnValue('Activity ID', activity)).toBe('my-activity');
    expect(getActivityColumnValue('Type', activity)).toBe('MyActivityType');
    expect(getActivityColumnValue('Start', activity)).toBe(
      '2024-01-02T03:04:05Z',
    );
  });

  it('builds a query duration from the proto seconds string', () => {
    expect(getActivityColumnValue('Execution Duration', activity)).toBe(
      '5m10s500ms',
    );
  });

  it('falls through to a custom search attribute of the same name', () => {
    expect(getActivityColumnValue('CustomKeywordField', activity)).toBe(
      'my-keyword',
    );
    expect(getActivityColumnValue('CustomIntField', activity)).toBe(42);
  });

  it('has no value for a column that is neither mapped nor indexed', () => {
    expect(getActivityColumnValue('Not A Column', activity)).toBeUndefined();
  });
});
