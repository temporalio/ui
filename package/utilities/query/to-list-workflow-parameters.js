import { formatDuration } from 'date-fns';
import { isExecutionStatus } from '../is';
import { durationKeys, fromDate } from '../to-duration';
import { tokenize } from './tokenize';
const is = (identifier) => (token) => {
    if (token.toLowerCase() === identifier.toLowerCase())
        return true;
    return false;
};
const getTwoAhead = (tokens, index) => tokens[index + 2];
export const getLargestDurationUnit = (duration) => {
    if (!duration)
        return;
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
export const toListWorkflowParameters = (query) => {
    const tokens = tokenize(query);
    const parameters = {
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
            if (isExecutionStatus(value))
                parameters.executionStatus = value;
        }
        if (isStartTimeStatement(token)) {
            const start = getTwoAhead(tokens, index);
            try {
                const duration = fromDate(start);
                const largestUnit = getLargestDurationUnit(duration);
                parameters.timeRange = formatDuration(largestUnit);
            }
            catch (error) {
                console.error('Error parsing StartTime from query', error);
            }
        }
    });
    return parameters;
};
