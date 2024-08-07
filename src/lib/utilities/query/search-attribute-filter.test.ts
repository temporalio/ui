import { writable } from 'svelte/store';

import { describe, expect, it } from 'vitest';

import type { SearchAttributes } from '$lib/types/workflows';

import {
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

describe('isStatusFilter', () => {
  it('should return true if the attribute is ExecutionStatus', () => {
    expect(isStatusFilter('ExecutionStatus')).toBe(true);
  });

  it('should return false if the attribute is not ExecutionStatus', () => {
    expect(isStatusFilter('WorkflowType')).toBe(false);
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
    expect(isDurationFilter('ExecutionDuration')).toBe(true);
  });

  it('should return false if the attribute is not ExecutionDuration', () => {
    expect(isDurationFilter('CustomB')).toBe(false);
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
