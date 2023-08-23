import { writable } from 'svelte/store';

import { describe, expect, it } from 'vitest';

import type { SearchAttributes } from '$lib/types/workflows';

import {
  isBooleanFilter,
  isDateTimeFilter,
  isListFilter,
  isNumberFilter,
  isStatusFilter,
  isTextFilter,
} from './filter-search';

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
  it('should return true if the attribute is a Keyword', () => {
    expect(isTextFilter('WorkflowType', store)).toBe(true);
  });

  it('should return true if the attribute is a Text', () => {
    expect(isTextFilter('CustomA', store)).toBe(true);
  });

  it('should return true if the attribute is a String', () => {
    expect(isTextFilter('CustomC', store)).toBe(true);
  });

  it('should return false if the attribute is not a Keyword or is ExecutionStatus', () => {
    expect(isTextFilter('ExecutionStatus', store)).toBe(false);
    expect(isTextFilter('BuildIds', store)).toBe(false);
  });
});

describe('isListFilter', () => {
  it('should return true if the attribute is a KeywordList', () => {
    expect(isListFilter('BuildIds', store)).toBe(true);
  });

  it('should return false if the attribute is not a KeywordList', () => {
    expect(isListFilter('WorkflowType', store)).toBe(false);
  });
});

describe('isNumberFilter', () => {
  it('should return true if the attribute is an Int', () => {
    expect(isNumberFilter('HistoryLength', store)).toBe(true);
  });

  it('should return true if the attribute is a Double', () => {
    expect(isNumberFilter('CustomB', store)).toBe(true);
  });

  it('should return false if the attribute is not an Int', () => {
    expect(isNumberFilter('WorkflowType', store)).toBe(false);
    expect(isNumberFilter('isStartTime', store)).toBe(false);
  });
});

describe('isBooleanFilter', () => {
  it('should return true if the attribute is a Bool', () => {
    expect(isBooleanFilter('TemporalSchedulePaused', store)).toBe(true);
  });

  it('should return false if the attribute is not a Bool', () => {
    expect(isBooleanFilter('WorkflowType', store)).toBe(false);
    expect(isBooleanFilter('HistoryLength', store)).toBe(false);
  });
});

describe('isDateTimeFilter', () => {
  it('should return true if the attribute is a Datetime', () => {
    expect(isDateTimeFilter('CloseTime', store)).toBe(true);
  });

  it('should return false if the attribute is not a Datetime', () => {
    expect(isDateTimeFilter('WorkflowType', store)).toBe(false);
    expect(isDateTimeFilter('HistoryLength', store)).toBe(false);
    expect(isDateTimeFilter('TemporalSchedulePaused', store)).toBe(false);
  });
});
