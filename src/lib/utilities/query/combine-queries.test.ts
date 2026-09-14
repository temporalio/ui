import { describe, expect, it } from 'vitest';

import { combineQueries } from './combine-queries';

describe('combineQueries', () => {
  it('should return the addition when there is no base query', () => {
    expect(combineQueries('', '`ExecutionStatus`="Running"')).toBe(
      '`ExecutionStatus`="Running"',
    );
  });

  it('should return the base when there is no addition', () => {
    expect(combineQueries('`WorkflowId`="abc"', '')).toBe('`WorkflowId`="abc"');
  });

  it('should return an empty query when both are empty', () => {
    expect(combineQueries('', '')).toBe('');
  });

  it('should join both queries with AND', () => {
    expect(
      combineQueries('`WorkflowId`="abc"', '`ExecutionStatus`="Running"'),
    ).toBe('`WorkflowId`="abc" AND `ExecutionStatus`="Running"');
  });

  it('should not duplicate an identical query', () => {
    expect(
      combineQueries(
        '`ExecutionStatus`="Running"',
        '`ExecutionStatus`="Running"',
      ),
    ).toBe('`ExecutionStatus`="Running"');
  });

  it('should trim surrounding whitespace', () => {
    expect(
      combineQueries('  `WorkflowId`="abc" ', ' StartTime >= "2024" '),
    ).toBe('`WorkflowId`="abc" AND StartTime >= "2024"');
  });

  it('should group a base query containing an ungrouped OR', () => {
    expect(
      combineQueries(
        '`ExecutionStatus`="Failed" OR `ExecutionStatus`="TimedOut"',
        'StartTime >= "2024-01-01T00:00:00.000Z"',
      ),
    ).toBe(
      '(`ExecutionStatus`="Failed" OR `ExecutionStatus`="TimedOut") AND StartTime >= "2024-01-01T00:00:00.000Z"',
    );
  });

  it('should not group a base query whose OR is already grouped', () => {
    expect(
      combineQueries(
        '(`ExecutionStatus`="Failed" OR `ExecutionStatus`="TimedOut") AND `TaskQueue`="a"',
        '`ParentWorkflowId` is null',
      ),
    ).toBe(
      '(`ExecutionStatus`="Failed" OR `ExecutionStatus`="TimedOut") AND `TaskQueue`="a" AND `ParentWorkflowId` is null',
    );
  });

  it('should ignore OR inside quoted values and attribute names', () => {
    expect(combineQueries('`WorkflowId`="or"', '`TaskQueue`="b"')).toBe(
      '`WorkflowId`="or" AND `TaskQueue`="b"',
    );
    expect(combineQueries('`Or Attribute`="x"', '`TaskQueue`="b"')).toBe(
      '`Or Attribute`="x" AND `TaskQueue`="b"',
    );
  });

  it('should ignore words that merely start with or', () => {
    expect(combineQueries('`Order`="x"', '`TaskQueue`="b"')).toBe(
      '`Order`="x" AND `TaskQueue`="b"',
    );
  });

  it('should preserve IN lists', () => {
    expect(
      combineQueries(
        '`ExecutionStatus`="Running" AND `TemporalReportedProblems` IN ("category=WorkflowTaskFailed")',
        'StartTime >= "2024-01-01T00:00:00.000Z"',
      ),
    ).toBe(
      '`ExecutionStatus`="Running" AND `TemporalReportedProblems` IN ("category=WorkflowTaskFailed") AND StartTime >= "2024-01-01T00:00:00.000Z"',
    );
  });
});
