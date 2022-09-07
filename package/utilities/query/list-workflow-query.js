import { isDuration, isDurationString, toDate, tomorrow } from '../to-duration';
const queryKeys = {
    workflowId: 'WorkflowId',
    workflowType: 'WorkflowType',
    timeRange: 'StartTime',
    executionStatus: 'ExecutionStatus',
    closeTime: 'CloseTime',
};
const filterKeys = [
    'workflowId',
    'workflowType',
    'timeRange',
    'executionStatus',
    'closeTime',
];
const isValid = (value) => {
    if (value === null)
        return false;
    if (value === undefined)
        return false;
    if (value === '')
        return false;
    if (typeof value === 'string' && value === 'undefined')
        return false;
    return true;
};
export const isFilterKey = (key) => {
    if (typeof key !== 'string')
        return false;
    for (const filterKey of filterKeys) {
        if (filterKey === key)
            return true;
    }
    return false;
};
const toQueryStatement = (key, value, archived) => {
    const queryKey = queryKeys[key];
    if (value === 'All')
        return '';
    if (isDuration(value) || isDurationString(value)) {
        if (archived) {
            return `${queryKey} > "${toDate(value)}"`;
        }
        return `${queryKey} BETWEEN "${toDate(value)}" AND "${tomorrow()}"`;
    }
    return `${queryKey}="${value}"`;
};
const toQueryStatements = (parameters, archived) => {
    return Object.entries(parameters)
        .map(([key, value]) => {
        if (isFilterKey(key) && isValid(value))
            return toQueryStatement(key, value, archived);
    })
        .filter(Boolean);
};
export const toListWorkflowQuery = (parameters, archived = false) => {
    return toQueryStatements(parameters, archived).join(' and ');
};
