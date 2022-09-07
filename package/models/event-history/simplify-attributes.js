import { formatDate, formatDuration } from '../../utilities/format-date';
const keysToBeFormattedAsTime = [
    'closeTime',
    'createTime',
    'currentAttemptScheduledTime',
    'earliestTime',
    'eventTime',
    'executionTime',
    'expirationTime',
    'expireTime',
    'lastAccessTime',
    'lastHeartbeatTime',
    'lastStartedTime',
    'lastUpdateTime',
    'latestTime',
    'releaseTime',
    'scheduledTime',
    'startedTime',
    'startTime',
    'workflowExecutionExpirationTime',
];
const keysToBeFormattedAsDuration = [
    'backoffStartInterval',
    'defaultWorkflowTaskTimeout',
    'firstWorkflowTaskBackoff',
    'heartbeatTimeout',
    'initialInterval',
    'maximumInterval',
    'scheduleToCloseTimeout',
    'scheduleToStartTimeout',
    'startToCloseTimeout',
    'startToFireTimeout',
    'workflowExecutionRetentionPeriod',
    'workflowExecutionRetentionTtl',
    'workflowExecutionTimeout',
    'workflowRunTimeout',
    'workflowTaskTimeout',
];
const isTime = (key) => {
    for (const timeKey of keysToBeFormattedAsTime) {
        if (timeKey === key)
            return true;
    }
    return false;
};
const isDuration = (key) => {
    for (const timeKey of keysToBeFormattedAsDuration) {
        if (timeKey === key)
            return true;
    }
    return false;
};
export const canBeSimplified = (value) => {
    if (value === null)
        return false;
    if (value === undefined)
        return false;
    if (typeof value !== 'object')
        return false;
    const keys = Object.keys(value);
    const [key] = keys;
    if (keys.length !== 1)
        return false;
    if (typeof value[key] !== 'string')
        return false;
    return true;
};
export const getValueForFirstKey = (value) => {
    for (const v of Object.values(value)) {
        return v;
    }
};
export function simplifyAttributes(attributes, preserveTimestamps = false) {
    for (const [key, value] of Object.entries(attributes)) {
        if (canBeSimplified(value)) {
            attributes[key] = getValueForFirstKey(value);
        }
        if (isTime(key) && !preserveTimestamps) {
            attributes[key] = formatDate(value);
        }
        if (isDuration(key)) {
            attributes[key] = formatDuration(value);
        }
    }
    return attributes;
}
