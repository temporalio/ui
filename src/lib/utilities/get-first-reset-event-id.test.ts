import { describe, test, expect } from 'vitest';
import { getFirstResetEventID } from './get-first-reset-event-id';

describe('getFirstResetEventID', () => {
  test('returns the first event of type WorkflowTaskStarted when events are in ascending order', () => {
    expect(
      getFirstResetEventID([
        {
          eventType: 'WorkflowExecutionStarted',
          id: '1',
        },
        {
          eventType: 'WorkflowTaskScheduled',
          id: '2',
        },
        {
          eventType: 'WorkflowTaskStarted',
          id: '3',
        },
        {
          eventType: 'WorkflowTaskCompleted',
          id: '4',
        },
      ]),
    ).toBe('3');
  });

  test('returns the first event of type WorkflowTaskCompleted when events are in descending order', () => {
    expect(
      getFirstResetEventID([
        {
          eventType: 'WorkflowTaskCompleted',
          id: '4',
        },
        {
          eventType: 'WorkflowTaskStarted',
          id: '3',
        },
        {
          eventType: 'WorkflowTaskScheduled',
          id: '2',
        },
        {
          eventType: 'WorkflowExecutionStarted',
          id: '1',
        },
      ]),
    ).toBe('4');
  });
});
