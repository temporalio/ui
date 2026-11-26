import { describe, expect, test } from 'vitest';

import { toEvent } from '$lib/models/event-history';
import type {
  ActivityOptions,
  ActivityTaskScheduledEventAttributes,
  HistoryEvent,
} from '$lib/types';

import { getUpdatedActivityOptions } from './activity-options-diff';
import { formatDuration } from './format-time';

const options = (overrides: Record<string, unknown> = {}) =>
  ({
    taskQueue: { name: 'queue' },
    scheduleToCloseTimeout: '100s',
    scheduleToStartTimeout: '20s',
    startToCloseTimeout: '10s',
    heartbeatTimeout: '5s',
    retryPolicy: {
      initialInterval: '1s',
      backoffCoefficient: 2,
      maximumInterval: '60s',
      maximumAttempts: 3,
    },
    ...overrides,
  }) as ActivityOptions;

const scheduled = (overrides: Record<string, unknown> = {}) =>
  ({
    activityId: '1',
    taskQueue: { name: 'queue', kind: 'TASK_QUEUE_KIND_NORMAL' },
    scheduleToCloseTimeout: '100s',
    scheduleToStartTimeout: '20s',
    startToCloseTimeout: '10s',
    heartbeatTimeout: '5s',
    retryPolicy: {
      initialInterval: '1s',
      backoffCoefficient: 2,
      maximumInterval: '60s',
      maximumAttempts: 3,
    },
    ...overrides,
  }) as ActivityTaskScheduledEventAttributes;

const fields = (changes: { field: string }[]) => changes.map((c) => c.field);

describe('getUpdatedActivityOptions', () => {
  test('returns nothing when either side is missing', () => {
    expect(getUpdatedActivityOptions(undefined, scheduled())).toEqual([]);
    expect(getUpdatedActivityOptions(null, scheduled())).toEqual([]);
    expect(getUpdatedActivityOptions(options(), undefined)).toEqual([]);
    expect(getUpdatedActivityOptions(options(), null)).toEqual([]);
  });

  test('returns nothing when the options carry no task queue', () => {
    expect(
      getUpdatedActivityOptions(
        options({ taskQueue: undefined }),
        scheduled({ taskQueue: { name: 'other' } }),
      ),
    ).toEqual([]);
    expect(
      getUpdatedActivityOptions(
        options({ taskQueue: { name: '' } }),
        scheduled(),
      ),
    ).toEqual([]);
  });

  test('returns nothing when every option matches', () => {
    expect(getUpdatedActivityOptions(options(), scheduled())).toEqual([]);
  });

  test('reports a changed task queue name', () => {
    expect(
      getUpdatedActivityOptions(
        options({ taskQueue: { name: 'new-queue' } }),
        scheduled(),
      ),
    ).toEqual([
      {
        field: 'taskQueue',
        label: 'common.task-queue',
        previous: 'queue',
        current: 'new-queue',
      },
    ]);
  });

  test('treats a task queue given as a bare string as equal to {name}', () => {
    expect(
      getUpdatedActivityOptions(options(), scheduled({ taskQueue: 'queue' })),
    ).toEqual([]);
  });

  test.each([
    ['scheduleToCloseTimeout', 'workflows.schedule-to-close-timeout'],
    ['scheduleToStartTimeout', 'workflows.schedule-to-start-timeout'],
    ['startToCloseTimeout', 'workflows.start-to-close-timeout'],
    ['heartbeatTimeout', 'activities.heartbeat-timeout'],
  ])('reports a changed %s', (field, label) => {
    const previous = scheduled()[field as keyof typeof scheduled] as string;

    expect(
      getUpdatedActivityOptions(options({ [field]: '300s' }), scheduled()),
    ).toEqual([
      {
        field,
        label,
        previous: formatDuration(String(previous)),
        current: formatDuration('300s'),
      },
    ]);
  });

  test('reports changed retry policy durations', () => {
    expect(
      getUpdatedActivityOptions(
        options({
          retryPolicy: {
            initialInterval: '5s',
            backoffCoefficient: 2,
            maximumInterval: '120s',
            maximumAttempts: 3,
          },
        }),
        scheduled(),
      ),
    ).toEqual([
      {
        field: 'retryPolicy.initialInterval',
        label: 'activities.retry-initial-interval',
        previous: formatDuration('1s'),
        current: formatDuration('5s'),
      },
      {
        field: 'retryPolicy.maximumInterval',
        label: 'activities.retry-maximum-interval',
        previous: formatDuration('60s'),
        current: formatDuration('120s'),
      },
    ]);
  });

  test.each([
    ['scheduleToStartTimeout', '0s'],
    ['heartbeatTimeout', ''],
  ])('treats %s of %s as unset', (field, zero) => {
    expect(
      getUpdatedActivityOptions(
        options({ [field]: zero }),
        scheduled({ [field]: undefined }),
      ),
    ).toEqual([]);
  });

  test('treats a zero retry interval as unset', () => {
    expect(
      getUpdatedActivityOptions(
        options({
          retryPolicy: {
            initialInterval: '0s',
            backoffCoefficient: 2,
            maximumInterval: '60s',
            maximumAttempts: 3,
          },
        }),
        scheduled({
          retryPolicy: {
            backoffCoefficient: 2,
            maximumInterval: '60s',
            maximumAttempts: 3,
          },
        }),
      ),
    ).toEqual([]);
  });

  test('treats the {seconds, nanos} form as equal to a seconds string', () => {
    expect(
      getUpdatedActivityOptions(
        options({ startToCloseTimeout: { seconds: '10', nanos: 0 } }),
        scheduled(),
      ),
    ).toEqual([]);
  });

  test('treats maximumAttempts of 0 as unset', () => {
    expect(
      getUpdatedActivityOptions(
        options({
          retryPolicy: {
            initialInterval: '1s',
            backoffCoefficient: 2,
            maximumInterval: '60s',
            maximumAttempts: 0,
          },
        }),
        scheduled({
          retryPolicy: {
            initialInterval: '1s',
            backoffCoefficient: 2,
            maximumInterval: '60s',
          },
        }),
      ),
    ).toEqual([]);
  });

  test('renders a cleared maximumAttempts as unlimited', () => {
    const [change] = getUpdatedActivityOptions(
      options({
        retryPolicy: {
          initialInterval: '1s',
          backoffCoefficient: 2,
          maximumInterval: '60s',
          maximumAttempts: 0,
        },
      }),
      scheduled(),
    );

    expect(change.field).toBe('retryPolicy.maximumAttempts');
    expect(change.previous).toBe('3');
    expect(change.current).toBe('Unlimited');
  });

  test('defaults an absent backoffCoefficient to 2', () => {
    expect(
      getUpdatedActivityOptions(
        options(),
        scheduled({
          retryPolicy: {
            initialInterval: '1s',
            maximumInterval: '60s',
            maximumAttempts: 3,
          },
        }),
      ),
    ).toEqual([]);

    expect(
      getUpdatedActivityOptions(
        options({
          retryPolicy: {
            initialInterval: '1s',
            backoffCoefficient: 3,
            maximumInterval: '60s',
            maximumAttempts: 3,
          },
        }),
        scheduled(),
      ),
    ).toEqual([
      {
        field: 'retryPolicy.backoffCoefficient',
        label: 'activities.retry-backoff-coefficient',
        previous: '2',
        current: '3',
      },
    ]);
  });

  test('reports changed priority and fairness keys', () => {
    expect(
      getUpdatedActivityOptions(
        options({ priority: { priorityKey: 3, fairnessKey: 'high' } }),
        scheduled({ priority: { priorityKey: 1, fairnessKey: '' } }),
      ),
    ).toEqual([
      {
        field: 'priority.priorityKey',
        label: 'workflows.priority',
        previous: '1',
        current: '3',
      },
      {
        field: 'priority.fairnessKey',
        label: 'workflows.fairness',
        previous: '',
        current: 'high',
      },
    ]);
  });

  test('never reports startDelay, which the scheduled event cannot carry', () => {
    expect(
      getUpdatedActivityOptions(options({ startDelay: '30s' }), scheduled()),
    ).toEqual([]);
  });

  test('orders changes by the canonical update-mask order', () => {
    const changes = getUpdatedActivityOptions(
      options({
        taskQueue: { name: 'new-queue' },
        heartbeatTimeout: '30s',
        priority: { priorityKey: 2 },
        retryPolicy: {
          initialInterval: '1s',
          backoffCoefficient: 2,
          maximumInterval: '60s',
          maximumAttempts: 10,
        },
      }),
      scheduled(),
    );

    expect(fields(changes)).toEqual([
      'taskQueue',
      'heartbeatTimeout',
      'retryPolicy.maximumAttempts',
      'priority.priorityKey',
    ]);
  });

  test('diffs the raw scheduled attributes, which toEvent leaves unformatted', () => {
    const event = toEvent({
      eventId: '5',
      eventTime: '2024-01-01T00:00:00Z',
      eventType: 'EVENT_TYPE_ACTIVITY_TASK_SCHEDULED',
      activityTaskScheduledEventAttributes: scheduled(),
    } as unknown as HistoryEvent);

    // `attributes` is humanized for display; the raw attributes are not. Diffing
    // the humanized copy would make every timeout look changed.
    expect(event.attributes.startToCloseTimeout).toBe('10 seconds');
    expect(event.activityTaskScheduledEventAttributes.startToCloseTimeout).toBe(
      '10s',
    );

    expect(
      getUpdatedActivityOptions(
        options(),
        event.activityTaskScheduledEventAttributes,
      ),
    ).toEqual([]);
  });
});
