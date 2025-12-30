import { writable } from 'svelte/store';

import { describe, expect, it, vi } from 'vitest';

import type { SearchAttributes } from '$lib/types/workflows';

import {
  formatDateTimeRange,
  formatListFilterValue,
  isBooleanFilter,
  isDateTimeFilter,
  isDurationFilter,
  isListFilter,
  isNumberFilter,
  isStatusFilter,
  isTextFilter,
} from './search-attribute-filter';

const store = writable<SearchAttributes>({
  BuildIds: 'KeywordList',
  CloseTime: 'Datetime',
  ExecutionStatus: 'Keyword',
  HistoryLength: 'Int',
  StartTime: 'Datetime',
  TemporalSchedulePaused: 'Bool',
  WorkflowId: 'Keyword',
  WorkflowType: 'Keyword',
  CustomA: 'Text',
  CustomB: 'Double',
  CustomC: 'String',
});

// force GH action runners to use en-US and 12-hour clocks starting at 0:00
const DateTimeFormat = Intl.DateTimeFormat;
vi.spyOn(global.Intl, 'DateTimeFormat').mockImplementation(
  (_, options) =>
    new DateTimeFormat('en-US', { ...options, hour12: true, hourCycle: 'h11' }),
);

describe('isStatusFilter', () => {
  it('should return true if the attribute is ExecutionStatus', () => {
    expect(isStatusFilter({ attribute: 'ExecutionStatus' })).toBe(true);
  });

  it('should return false if the attribute is not ExecutionStatus', () => {
    expect(isStatusFilter({ attribute: 'WorkflowType' })).toBe(false);
  });
});

describe('isTextFilter', () => {
  it('should return true if the type is a Keyword', () => {
    expect(isTextFilter({ attribute: 'WorkflowType', type: 'Keyword' })).toBe(
      true,
    );
  });

  it('should return true if the attribute is a Keyword', () => {
    expect(isTextFilter({ attribute: 'WorkflowType' }, store)).toBe(true);
  });

  it('should return true if the attribute is a Text', () => {
    expect(isTextFilter({ attribute: 'CustomA' }, store)).toBe(true);
  });

  it('should return true if the attribute is a String', () => {
    expect(isTextFilter({ attribute: 'CustomC' }, store)).toBe(true);
  });

  it('should return false if the attribute is not a Keyword or is ExecutionStatus', () => {
    expect(
      isTextFilter({ attribute: 'ExecutionStatus', type: 'Keyword' }),
    ).toBe(false);
    expect(isTextFilter({ attribute: 'BuildIds' }, store)).toBe(false);
  });
});

describe('isListFilter', () => {
  it('should return true if the type is a KeywordList', () => {
    expect(isListFilter({ attribute: 'BuildIds', type: 'KeywordList' })).toBe(
      true,
    );
  });

  it('should return true if the attribute is a KeywordList', () => {
    expect(isListFilter({ attribute: 'BuildIds' }, store)).toBe(true);
  });

  it('should return false if the attribute is not a KeywordList', () => {
    expect(isListFilter({ attribute: 'WorkflowType' }, store)).toBe(false);
  });
});

describe('isNumberFilter', () => {
  it('should return true if the type is an Int', () => {
    expect(isNumberFilter({ attribute: 'HistoryLength', type: 'Int' })).toBe(
      true,
    );
  });

  it('should return true if the attribute is an Int', () => {
    expect(isNumberFilter({ attribute: 'HistoryLength' }, store)).toBe(true);
  });

  it('should return true if the attribute is a Double', () => {
    expect(isNumberFilter({ attribute: 'CustomB' }, store)).toBe(true);
  });

  it('should return false if the attribute is not an Int', () => {
    expect(isNumberFilter({ attribute: 'WorkflowType' }, store)).toBe(false);
    expect(isNumberFilter({ attribute: 'isStartTime' }, store)).toBe(false);
  });
});

describe('isDurationFilter', () => {
  it('should return true if the attribute is ExecutionDuration', () => {
    expect(isDurationFilter({ attribute: 'ExecutionDuration' })).toBe(true);
  });

  it('should return false if the attribute is not ExecutionDuration', () => {
    expect(isDurationFilter({ attribute: 'CustomB' })).toBe(false);
  });
});

describe('isBooleanFilter', () => {
  it('should return true if the type is a Bool', () => {
    expect(
      isBooleanFilter({ attribute: 'TemporalSchedulePaused', type: 'Bool' }),
    ).toBe(true);
  });

  it('should return true if the attribute is a Bool', () => {
    expect(
      isBooleanFilter({ attribute: 'TemporalSchedulePaused' }, store),
    ).toBe(true);
  });

  it('should return false if the attribute is not a Bool', () => {
    expect(isBooleanFilter({ attribute: 'WorkflowType' }, store)).toBe(false);
    expect(isBooleanFilter({ attribute: 'HistoryLength' }, store)).toBe(false);
  });
});

describe('isDateTimeFilter', () => {
  it('should return true if the attribute is a Datetime', () => {
    expect(isDateTimeFilter({ attribute: 'CloseTime' }, store)).toBe(true);
  });

  it('should return true if the type is a Datetime', () => {
    expect(isDateTimeFilter({ attribute: 'CloseTime', type: 'Datetime' })).toBe(
      true,
    );
  });

  it('should return false if the attribute is not a Datetime', () => {
    expect(isDateTimeFilter({ attribute: 'WorkflowType' }, store)).toBe(false);
    expect(isDateTimeFilter({ attribute: 'HistoryLength' }, store)).toBe(false);
    expect(
      isDateTimeFilter({ attribute: 'TemporalSchedulePaused' }, store),
    ).toBe(false);
  });
});

describe('formatListFilterValue', () => {
  it('should return an empty array if there is no value', () => {
    expect(formatListFilterValue('')).toStrictEqual([]);
  });

  it('should return an array of strings if the value starts with "(" and ends with ")"', () => {
    expect(formatListFilterValue('("one")')).toStrictEqual(['one']);
    expect(formatListFilterValue('("one", "two")')).toStrictEqual([
      'one',
      'two',
    ]);
    expect(formatListFilterValue('("one","two","three")')).toStrictEqual([
      'one',
      'two',
      'three',
    ]);
  });

  it('should return an array with the value', () => {
    expect(formatListFilterValue('example')).toStrictEqual(['example']);
  });
});

describe('formatDateTimeRange', () => {
  it('should format a date range between two dates', () => {
    expect(
      formatDateTimeRange(
        'BETWEEN "2025-07-17T12:00:00.000Z" AND "2025-07-17T13:00:00.000Z"',
        'UTC',
        false,
      ),
    ).toStrictEqual(
      'between 7/17/25, 12:00:00.00 PM UTC and 7/17/25, 1:00:00.00 PM UTC',
    );
    expect(
      formatDateTimeRange(
        'BETWEEN 2025-07-17T12:00:00.000Z AND 2025-07-17T13:00:00.000Z',
        'UTC',
        false,
      ),
    ).toContain(
      'between 7/17/25, 12:00:00.00 PM UTC and 7/17/25, 1:00:00.00 PM UTC',
    );
  });

  it('should format a date range between two dates with a different time format', () => {
    expect(
      formatDateTimeRange(
        'BETWEEN "2025-07-17T00:00:00.000Z" AND "2025-07-17T00:00:00.000Z"',
        'Pacific Daylight Time',
        false,
      ),
    ).toStrictEqual(
      'between 7/16/25, 5:00:00.00 PM PDT and 7/16/25, 5:00:00.00 PM PDT',
    );
  });
});
