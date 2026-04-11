import { describe, expect, it } from 'vitest';

import type {
  CommonErrorCategory,
  CommonErrorSeverity,
} from '$lib/types/common-errors';

import {
  COMMON_ERRORS,
  getCommonErrorById,
  getCommonErrorsByCategory,
} from './common-errors-data';

const VALID_SEVERITIES: CommonErrorSeverity[] = ['error', 'warning', 'info'];

const VALID_CATEGORIES: CommonErrorCategory[] = [
  'workflow-timeouts',
  'continue-as-new',
  'retry-policies',
  'activity-timeouts',
  'heartbeat',
  'delayed-start',
  'local-activities',
  'event-history',
  'multiple-payloads',
  'workflow-id-reuse',
  'memo-headers',
];

describe('COMMON_ERRORS', () => {
  it('contains 35 errors', () => {
    expect(COMMON_ERRORS).toHaveLength(35);
  });

  it('has no duplicate IDs', () => {
    const ids = COMMON_ERRORS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has valid severity for every error', () => {
    for (const error of COMMON_ERRORS) {
      expect(VALID_SEVERITIES).toContain(error.severity);
    }
  });

  it('has valid category for every error', () => {
    for (const error of COMMON_ERRORS) {
      expect(VALID_CATEGORIES).toContain(error.category);
    }
  });

  it('has required fields for every error', () => {
    for (const error of COMMON_ERRORS) {
      expect(error.id).toBeTypeOf('number');
      expect(error.title).toBeTruthy();
      expect(error.description).toBeTruthy();
      expect(error.link).toBeTruthy();
      expect(error.action).toBeTruthy();
      expect(error.category).toBeTruthy();
    }
  });

  it('has valid links for every error', () => {
    for (const error of COMMON_ERRORS) {
      expect(error.link).toMatch(/^https:\/\/docs\.temporal\.io\//);
    }
  });
});

describe('getCommonErrorById', () => {
  it('returns the correct error for a valid ID', () => {
    const error = getCommonErrorById(1);
    expect(error).toBeDefined();
    expect(error?.id).toBe(1);
    expect(error?.title).toBe('Workflow Execution Timeout Set');
  });

  it('returns undefined for an invalid ID', () => {
    expect(getCommonErrorById(999)).toBeUndefined();
  });

  it('returns undefined for ID 0', () => {
    expect(getCommonErrorById(0)).toBeUndefined();
  });
});

describe('getCommonErrorsByCategory', () => {
  it('returns only errors matching the category', () => {
    const errors = getCommonErrorsByCategory('workflow-timeouts');
    expect(errors.length).toBeGreaterThan(0);
    for (const error of errors) {
      expect(error.category).toBe('workflow-timeouts');
    }
  });

  it('returns 6 workflow-timeouts errors', () => {
    expect(getCommonErrorsByCategory('workflow-timeouts')).toHaveLength(6);
  });

  it('returns 3 continue-as-new errors', () => {
    expect(getCommonErrorsByCategory('continue-as-new')).toHaveLength(3);
  });

  it('returns errors for memo-headers category', () => {
    expect(getCommonErrorsByCategory('memo-headers')).toHaveLength(1);
  });
});
