import { describe, expect, test } from 'vitest';

import {
  isWorkflowTaskFailure,
  TemporalReportedProblems,
} from './workflow-task-failures';

describe('isWorkflowTaskFailure', () => {
  test('returns true when workflow is running and includes at least one Temporal reported problem', () => {
    expect(
      isWorkflowTaskFailure({
        searchAttributes: {
          indexedFields: {
            TemporalReportedProblems: [TemporalReportedProblems[0]],
          },
        },
        status: 'Running',
      }),
    ).toBe(true);
    expect(
      isWorkflowTaskFailure({
        searchAttributes: {
          indexedFields: {
            TemporalReportedProblems,
          },
        },
        status: 'Running',
      }),
    ).toBe(true);
  });

  test('returns false when workflow does not have defined search attributes', () => {
    expect(isWorkflowTaskFailure({ status: 'Running' })).toBe(false);
  });

  test('returns false when workflow does not have a status of Running', () => {
    expect(
      isWorkflowTaskFailure({ searchAttributes: {}, status: 'Completed' }),
    ).toBe(false);
  });

  test('returns false when workflow does not have at least one TemporalReportedProblems', () => {
    expect(
      isWorkflowTaskFailure({
        searchAttributes: {
          indexedFields: {
            TemporalReportedProblems: ['category=SomeOtherProblem'],
          },
        },
        status: 'Running',
      }),
    ).toBe(false);
  });
});
