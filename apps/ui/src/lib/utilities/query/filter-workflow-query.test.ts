import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toListWorkflowQueryFromFilters } from './filter-workflow-query';
import { combineFilters } from './to-list-workflow-filters';
import { isVersionNewer } from '../version-check';

describe('toListWorkflowQueryFromFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01').getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return an empty string for empty filters', () => {
    const query = toListWorkflowQueryFromFilters([]);
    expect(query).toBe('');
  });

  it('should ignore empty value filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: '',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('');
  });

  it('should convert an ExecutionStatus filter', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Running',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`ExecutionStatus`="Running"');
  });

  it('should convert multiple ExecutionStatus filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Running',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: ')',
        value: 'Failed',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe(
      '(`ExecutionStatus`="Running" OR `ExecutionStatus`="Canceled" OR `ExecutionStatus`="Failed")',
    );
  });

  it('should convert a boolean filter', () => {
    const filters = [
      {
        attribute: 'CustomBoolField',
        type: 'Bool',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'false',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`CustomBoolField`=false');
  });

  it('should convert two different filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'abcd',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe('`ExecutionStatus`="Running" AND `WorkflowId`="abcd"');
  });

  it('should convert three different filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'abcd',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'cronWorkflow',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe(
      '`ExecutionStatus`="Running" AND `WorkflowId`="abcd" AND `WorkflowType`="cronWorkflow"',
    );
  });

  it('should convert datetime filter', () => {
    const filters = [
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
      },
    ];

    const supportsAdvancedVisibility = isVersionNewer('1.20', '1.19');
    const query = toListWorkflowQueryFromFilters(
      filters,
      supportsAdvancedVisibility,
    );
    expect(query).toBe('StartTime > "2019-12-30T00:00:00.000Z"');
  });

  it('should convert two filters, one as datetime filter', () => {
    const filters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'cronWorkflow',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
      },
    ];
    const supportsAdvancedVisibility = isVersionNewer('1.20', '1.19');
    const query = toListWorkflowQueryFromFilters(
      combineFilters(filters),
      supportsAdvancedVisibility,
    );
    expect(query).toBe(
      '`WorkflowType`="cronWorkflow" AND StartTime > "2019-12-30T00:00:00.000Z"',
    );
  });

  it('should convert a KeywordList filter', () => {
    const filters = [
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'in',
        operator: '',
        parenthesis: '',
        value: '("Hello", "World")',
      },
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'is',
        operator: '',
        parenthesis: '',
        value: null,
      },
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe(
      '`CustomKeywordListField`in("Hello", "World") AND `CustomKeywordListField` is null AND `CustomKeywordListField`="Hello"',
    );
  });
});
