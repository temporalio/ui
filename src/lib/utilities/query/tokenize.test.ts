import { describe, expect, it } from 'vitest';

import { tokenize } from './tokenize';

const executionStatusQuery = 'ExecutionStatus="Completed"';
const startTimeQuery = 'StartTime > "2022-04-18T17:45:18-06:00"';
const workflowQuery = 'WorkflowId="Hello" and WorkflowType="World"';
const combinedQuery =
  'WorkflowId="Hello" and WorkflowType="World" and StartTime BETWEEN "2022-04-18T18:09:49-06:00" AND "2022-04-20T18:09:49-06:00"';

describe('tokenize', () => {
  it('should eliminate spaces', () => {
    const query = 'one and two';

    expect(tokenize(query)).toEqual(['one', 'and', 'two']);
  });

  it('should respect "=" signs', () => {
    const query = 'one = 1';

    expect(tokenize(query)).toEqual(['one', '=', '1']);
  });

  it('should ignore quotes', () => {
    const query = 'one = "1" and two = \'2\'';

    expect(tokenize(query)).toEqual(['one', '=', '1', 'and', 'two', '=', '2']);
  });

  it('should tokenize the executionStatusQuery', () => {
    const query = executionStatusQuery;

    expect(tokenize(query)).toEqual(['ExecutionStatus', '=', 'Completed']);
  });

  it('should tokenize the startTimeQuery', () => {
    const query = startTimeQuery;

    expect(tokenize(query)).toEqual([
      'StartTime',
      '>',
      '2022-04-18T17:45:18-06:00',
    ]);
  });

  it('should tokenize the workflowQuery', () => {
    const query = workflowQuery;

    expect(tokenize(query)).toEqual([
      'WorkflowId',
      '=',
      'Hello',
      'and',
      'WorkflowType',
      '=',
      'World',
    ]);
  });

  it('should tokenize the combinedQuery', () => {
    const query = combinedQuery;

    expect(tokenize(query)).toEqual([
      'WorkflowId',
      '=',
      'Hello',
      'and',
      'WorkflowType',
      '=',
      'World',
      'and',
      'StartTime',
      'BETWEEN',
      '2022-04-18T18:09:49-06:00',
      'AND',
      '2022-04-20T18:09:49-06:00',
    ]);
  });
});
