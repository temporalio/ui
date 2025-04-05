import { formatDuration } from 'date-fns';

import type { FilterParameters } from '$lib/types/workflows';

import { tokenize } from './tokenize';
import { isExecutionStatus } from '../is';
import { durationKeys, fromDate } from '../to-duration';

type Tokens = string[];
export type ParsedParameters = FilterParameters & { timeRange?: string };

const is =
  (identifier: string) =>
  (token: string): boolean => {
    if (token.toLowerCase() === identifier.toLowerCase()) return true;
    return false;
  };

const getTwoAhead = (tokens: Tokens, index: number): string =>
  tokens[index + 2];

export const getLargestDurationUnit = (duration: Duration): Duration => {
  if (!duration) return;
  for (const key of durationKeys) {
    if (duration[key]) {
      return { [key]: duration[key] };
    }
  }
};

const isWorkflowTypeStatement = is('WorkflowType');
const isWorkflowIdStatement = is('WorkflowId');
const isStartTimeStatement = is('StartTime');
const isExecutionStatusStatement = is('ExecutionStatus');

export const toListWorkflowParameters = (query: string): ParsedParameters => {
  const tokens = tokenize(query);
  const parameters: ParsedParameters = {
    workflowId: '',
    workflowType: '',
    executionStatus: null,
    timeRange: null,
  };

  tokens.forEach((token, index) => {
    if (isWorkflowIdStatement(token))
      parameters.workflowId = getTwoAhead(tokens, index);

    if (isWorkflowTypeStatement(token))
      parameters.workflowType = getTwoAhead(tokens, index);

    if (isExecutionStatusStatement(token)) {
      const value = getTwoAhead(tokens, index);
      if (isExecutionStatus(value)) parameters.executionStatus = value;
    }

    if (isStartTimeStatement(token)) {
      const start = getTwoAhead(tokens, index);

      try {
        const duration = fromDate(start);
        const largestUnit = getLargestDurationUnit(duration);

        parameters.timeRange = formatDuration(largestUnit);
      } catch (error) {
        console.error('Error parsing StartTime from query', error);
      }
    }
  });

  return parameters;
};
