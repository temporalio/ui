import { describe, expect, it } from 'vitest';

import { tokenize } from './tokenize';

const executionStatusQuery = '`ExecutionStatus`="Completed"';
const startTimeQuery = '`StartTime` > "2022-04-18T17:45:18-06:00"';
const workflowQuery = '`WorkflowId`="Hello" and `WorkflowType`="World"';
const customAttributesWithSpacesQuery =
  '(`ExecutionStatus`="Running" OR `ExecutionStatus`="TimedOut") AND `Custom Key Word`="Hello there" AND `WorkflowId`="some workflow" AND `Custom Boolean`=true';
const combinedQuery =
  '`WorkflowId`="Hello" and `WorkflowType`="World" and `StartTime` BETWEEN "2022-04-18T18:09:49-06:00" AND "2022-04-20T18:09:49-06:00"';
const valuesWithSpacesQuery =
  '`Custom Key Word`="Hello there world" AND `WorkflowId`="one and two = three" OR `WorkflowType`="example=\'one\'"';
const keywordListQuery = '`CustomKeywordListField`in("Hello", "World")';
const startsWithQuery = '`WorkflowType` STARTS_WITH "Hello"';
const startsWithInQuery = '`WorkflowType` STARTS_WITH "Inspect"';

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

  it('should tokenize the customAttributesWithSpacesQuery', () => {
    const query = customAttributesWithSpacesQuery;

    expect(tokenize(query)).toEqual([
      '(',
      'ExecutionStatus',
      '=',
      'Running',
      'OR',
      'ExecutionStatus',
      '=',
      'TimedOut',
      ')',
      'AND',
      'Custom Key Word',
      '=',
      'Hello there',
      'AND',
      'WorkflowId',
      '=',
      'some workflow',
      'AND',
      'Custom Boolean',
      '=true',
    ]);
  });

  it('should tokenize the keywordListQuery', () => {
    const query = keywordListQuery;

    expect(tokenize(query)).toEqual([
      'CustomKeywordListField',
      'in',
      '("Hello", "World")',
    ]);
  });

  it('should tokenize with "`" not used in custom attributes with spaces', () => {
    expect(tokenize('one = "one `"')).toEqual(['one', '=', 'one', '`']);
    expect(tokenize('one = "one `1`"')).toEqual(['one', '=', 'one', '`1`']);
    expect(tokenize('one = "`one"')).toEqual(['one', '=', '`one']);
    expect(tokenize('one = 1 `')).toEqual(['one', '=', '1', '`']);
    expect(tokenize('`one = 1')).toEqual(['`one', '=', '1']);
    expect(tokenize('one = `1')).toEqual(['one', '=', '`1']);
  });

  it('should tokenize the valueWithSpacesQuery', () => {
    const query = valuesWithSpacesQuery;

    expect(tokenize(query)).toEqual([
      'Custom Key Word',
      '=',
      'Hello there world',
      'AND',
      'WorkflowId',
      '=',
      'one and two = three',
      'OR',
      'WorkflowType',
      '=',
      "example='one'",
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

  it('should tokenize the startsWithQuery', () => {
    const query = startsWithQuery;

    expect(tokenize(query)).toEqual(['WorkflowType', 'STARTS_WITH', 'Hello']);
  });

  it('should tokenize the startsWithQuery', () => {
    const query = startsWithInQuery;

    expect(tokenize(query)).toEqual(['WorkflowType', 'STARTS_WITH', 'Inspect']);
  });
});
