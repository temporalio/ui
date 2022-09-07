const executionStatuses = [
    'Running',
    'TimedOut',
    'Completed',
    'Failed',
    'Completed',
    'ContinuedAsNew',
    'Canceled',
    'Terminated',
];
const operators = [
    '=',
    '>',
    '<',
    '!',
    '>=',
    '<=',
    '==',
    '!=',
    '===',
    '!==',
    'and',
    'or',
    'between',
    'order by',
    'in',
    '(',
    ')',
];
export const isString = (x) => typeof x === 'string';
export const isNull = (x) => x === null;
export const isObject = (x) => {
    if (isNull(x))
        return false;
    if (Array.isArray(x))
        return false;
    if (typeof x === 'object')
        return true;
    return false;
};
export const isNumber = (x) => {
    if (typeof x === 'number')
        return true;
    return false;
};
export const isExecutionStatus = (x) => {
    if (!isString(x))
        return false;
    for (const status of executionStatuses) {
        if (x === status)
            return true;
    }
    return false;
};
export const isSpace = (x) => {
    return x === ' ';
};
export const isQuote = (x) => {
    if (x === "'")
        return true;
    if (x === '"')
        return true;
    return false;
};
export const isOperator = (x) => {
    if (!isString(x))
        return false;
    x = x.toLocaleLowerCase();
    for (const operator of operators) {
        if (x === operator)
            return true;
    }
    return false;
};
export const isSortOrder = (sortOrder) => {
    if (sortOrder === 'ascending')
        return true;
    if (sortOrder === 'descending')
        return true;
    return false;
};
