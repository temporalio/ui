import { describe, expect, test } from 'vitest';

import type { ActivityOptions } from '$lib/types';

import {
  ACTIVITY_OPTIONS_UPDATE_PATHS,
  activityOptionsUpdateMask,
} from './activity-options-update-mask';

const BASE_MASK = ACTIVITY_OPTIONS_UPDATE_PATHS.join(',');

const options = (overrides: Partial<ActivityOptions> = {}) =>
  ({
    taskQueue: { name: 'queue' },
    scheduleToCloseTimeout: '10s',
    ...overrides,
  }) as ActivityOptions;

describe('activityOptionsUpdateMask', () => {
  test('omits optional paths when no value is supplied', () => {
    expect(activityOptionsUpdateMask(options())).toBe(BASE_MASK);
    expect(activityOptionsUpdateMask(undefined)).toBe(BASE_MASK);
    expect(activityOptionsUpdateMask(null)).toBe(BASE_MASK);
  });

  test('omits optional paths set to an empty value', () => {
    expect(activityOptionsUpdateMask(options({ startDelay: '' }))).toBe(
      BASE_MASK,
    );
  });

  test('includes startDelay when supplied', () => {
    expect(activityOptionsUpdateMask(options({ startDelay: '30s' }))).toBe(
      `${BASE_MASK},startDelay`,
    );
  });

  test('supports nested optional paths', () => {
    expect(
      activityOptionsUpdateMask(
        options({ retryPolicy: { maximumAttempts: 3 } }),
        ['retryPolicy.maximumAttempts', 'retryPolicy.nonRetryableErrorTypes'],
      ),
    ).toBe(`${BASE_MASK},retryPolicy.maximumAttempts`);
  });
});
