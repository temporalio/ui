import { formatDuration } from 'date-fns';
import { isExecutionStatus } from '../is';
import { fromDate } from '../to-duration';
import { tokenize } from './tokenize';

type Tokens = string[];

const is =
  (identifier: string) =>
  (token: string): boolean => {
    if (token.toLowerCase() === identifier.toLowerCase()) return true;
    return false;
  };

const getAhead =
  (n: number) =>
  (tokens: Tokens, index: number): string =>
    tokens[index + n];

const isWorkflowTypeStatement = is('WorkflowType');
const isWorkflowIdStatement = is('WorkflowId');
const isStartTimeStatement = is('StartTime');
const isExecutionStatusStatement = is('ExecutionStatus');
const getTwoAhead = getAhead(2);
const getFourAhead = getAhead(4);

export const toListWorkflowParameters = (
  query: string,
): ValidWorkflowParameters => {
  const tokens = tokenize(query);
  const parameters: ValidWorkflowParameters = {};

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
      const end = getFourAhead(tokens, index);

      try {
        const duration = fromDate(start, end);
        parameters.timeRange = formatDuration(duration, {
          zero: false,
          delimiter: ',',
        });
      } catch (error) {
        console.error('Error parsing StartTime from query', error);
      }
    }
  });

  return parameters;
};
