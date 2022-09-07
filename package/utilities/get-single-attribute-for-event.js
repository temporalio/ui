import { isEventGroup } from '../models/event-groups';
import { capitalize } from './format-camel-case';
const emptyAttribute = { key: '', value: '' };
const keysForPlainText = new Set([
    'activityId',
    'attempt',
    'binaryChecksum',
    'identity',
    'parentInitiatedEventId',
    'requestId',
    'scheduledEventId',
    'startedEventId',
    'lastHeartbeatTime',
    'scheduledTime',
    'expirationTime',
]);
export const shouldDisplayAsPlainText = (key) => {
    return keysForPlainText.has(key);
};
export const shouldDisplayAttribute = (key, value) => {
    if (value === null)
        return false;
    if (value === undefined)
        return false;
    if (value === '')
        return false;
    if (value === '0s')
        return false;
    if (key === 'type')
        return false;
    return true;
};
export const shouldDisplayNestedAttribute = (value) => {
    if (value === null)
        return false;
    if (value === undefined)
        return false;
    if (value === '')
        return false;
    if (Array.isArray(value) && !value.length)
        return false;
    return true;
};
export const getCodeBlockValue = (value) => {
    var _a, _b, _c;
    if (typeof value === 'string')
        return value;
    return (_c = (_b = (_a = value === null || value === void 0 ? void 0 : value.payloads) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.indexedFields) !== null && _b !== void 0 ? _b : value === null || value === void 0 ? void 0 : value.points) !== null && _c !== void 0 ? _c : value;
};
const keysWithExecutionLinks = [
    'baseRunId',
    'continuedExecutionRunId',
    'firstExecutionRunId',
    'newExecutionRunId',
    'newRunId',
    'originalExecutionRunId',
];
// For linking to same workflow but different execution
export const shouldDisplayAsExecutionLink = (key) => {
    for (const workflowKey of keysWithExecutionLinks) {
        if (key === workflowKey)
            return true;
    }
    return false;
};
const keysWithTaskQueueLinks = ['taskQueueName'];
export const shouldDisplayAsTaskQueueLink = (key) => {
    for (const taskQueueKey of keysWithTaskQueueLinks) {
        if (key === taskQueueKey)
            return true;
    }
    return false;
};
const formatSummaryValue = (key, value) => {
    if (typeof value === 'object') {
        const [firstKey] = Object.keys(value);
        return { key: key + capitalize(firstKey), value: value[firstKey] };
    }
    else {
        return { key, value: value.toString() };
    }
};
/**
 * A list of the keys that should be shown in the summary view.
 */
const preferredSummaryKeys = [
    'failure',
    'input',
    'activityType',
    'parentInitiatedEventId',
    'workflowType',
    'taskQueue',
];
/**
 * Returns that first event attribute that is eligible to be displayed.
 */
const getFirstDisplayAttribute = ({ attributes, }) => {
    for (const [key, value] of Object.entries(attributes)) {
        if (shouldDisplayAttribute(key, value)) {
            return formatSummaryValue(key, value);
        }
    }
};
/**
 * Iterates through the keys of an event and compares it with the list of
 * preferred keys. If a preferred key is found, it will be returned.
 * Otherwise, it will return the first eligible event attribute.
 */
const getSummaryAttribute = (event) => {
    const first = getFirstDisplayAttribute(event);
    for (const [key, value] of Object.entries(event.attributes)) {
        for (const preferredKey of preferredSummaryKeys) {
            if (key === preferredKey && shouldDisplayAttribute(key, value))
                return formatSummaryValue(key, value);
        }
    }
    return first;
};
export const getSummaryForEventGroup = ({ lastEvent, }) => {
    return getSummaryAttribute(lastEvent);
};
export const getSingleAttributeForEvent = (event) => {
    if (!event)
        return emptyAttribute;
    if (isEventGroup(event)) {
        return getSummaryForEventGroup(event);
    }
    return getSummaryAttribute(event);
};
