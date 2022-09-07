import { formatDate } from './format-date';
import { shouldDisplayAttribute, shouldDisplayNestedAttribute, } from './get-single-attribute-for-event';
import { capitalize } from './format-camel-case';
const keysToOmit = new Set(['header']);
const keysToExpand = new Set([
    'taskQueue',
    'retryPolicy',
    'parentWorkflowExecution',
    'workflowExecution',
]);
const keysToFormat = new Set(['maximumAttempts']);
export const UnlimitedAttempts = 'Unlimited';
export const NoExpiration = 'No Expiration';
export const formatRetryExpiration = (maxAttempts, expiration) => {
    if (maxAttempts === 0) {
        return NoExpiration;
    }
    return expiration;
};
export const formatAttemptsLeft = (maxAttempts, attempt) => {
    if (maxAttempts === 0) {
        return UnlimitedAttempts;
    }
    return maxAttempts - attempt;
};
export const formatMaximumAttempts = (maxAttempts) => {
    if (maxAttempts === 0) {
        return UnlimitedAttempts;
    }
    return maxAttempts;
};
const formatValue = (key, value) => {
    if (key === 'maximumAttempts' && value === 0) {
        return UnlimitedAttempts;
    }
    return value;
};
const formatNestedAttributes = (attributes, key) => {
    if (keysToExpand.has(key) && typeof attributes[key] === 'object') {
        for (const [nestedKey, nestedValue] of Object.entries(attributes[key])) {
            const shouldDisplayNested = shouldDisplayNestedAttribute(nestedValue);
            if (shouldDisplayNested) {
                if (keysToFormat.has(nestedKey)) {
                    attributes[`${key}${capitalize(nestedKey)}`] = formatValue(nestedKey, nestedValue);
                }
                else {
                    attributes[`${key}${capitalize(nestedKey)}`] = nestedValue;
                }
            }
        }
        delete attributes[key];
    }
};
export const formatAttributes = (event, { compact } = { compact: false }) => {
    const attributes = {};
    if (compact)
        attributes.eventTime = formatDate(event.eventTime);
    for (const [key, value] of Object.entries(event.attributes)) {
        const shouldDisplay = shouldDisplayAttribute(key, value);
        if (!keysToOmit.has(key) && shouldDisplay)
            attributes[key] = value;
        formatNestedAttributes(attributes, key);
    }
    return attributes;
};
const attributeGroupings = [
    'summary',
    'parent',
    'activity',
    'taskQueue',
    'schedule',
    'retryPolicy',
    'workflow',
    'searchAttributes',
];
export const attributeGroupingProperties = {
    activity: { label: 'Activity', color: 'gray' },
    parent: { label: 'Parent', color: 'gray' },
    retryPolicy: { label: 'Retry Policy', color: 'gray' },
    schedule: { label: 'Schedule', color: 'gray' },
    searchAttributes: { label: 'Search Attributes', color: 'gray' },
    summary: { label: 'Summary', color: 'gray' },
    taskQueue: { label: 'Task Queue', color: 'gray' },
    workflow: { label: 'Workflow', color: 'gray' },
};
const consolidateActivityGroups = (event, groupedAttributes) => {
    var _a, _b;
    // Move activity group into summary if activity
    if (event.category === 'activity' && ((_a = groupedAttributes === null || groupedAttributes === void 0 ? void 0 : groupedAttributes.activity) === null || _a === void 0 ? void 0 : _a.length)) {
        groupedAttributes.summary = [
            ...groupedAttributes.activity,
            ...groupedAttributes.summary,
        ];
        groupedAttributes.activity = [];
    }
    // Move workflow group into summary if activity
    if (event.category === 'activity' && ((_b = groupedAttributes === null || groupedAttributes === void 0 ? void 0 : groupedAttributes.workflow) === null || _b === void 0 ? void 0 : _b.length)) {
        groupedAttributes.summary = [
            ...groupedAttributes.summary,
            ...groupedAttributes.workflow,
        ];
        groupedAttributes.workflow = [];
    }
};
const consolidateSingleItemGroups = (groupedAttributes) => {
    const keysToIgnore = new Set([
        'summary',
        'searchAttributes',
    ]);
    for (const [key, value] of Object.entries(groupedAttributes)) {
        if (value.length === 1 && !keysToIgnore.has(key)) {
            groupedAttributes.summary = [...groupedAttributes.summary, ...value];
            groupedAttributes[key] = [];
        }
    }
};
export const attributeGroups = (event, attributes) => {
    const groupedAttributes = {};
    attributeGroupings.forEach((group) => {
        if (group === 'summary') {
            groupedAttributes[group] = Object.keys(attributes);
        }
        else {
            groupedAttributes[group] = [];
        }
    });
    for (const key of Object.keys(attributes)) {
        const attributeGroup = attributeGroupings.find((group) => key.includes(group));
        if (attributeGroup) {
            groupedAttributes[attributeGroup] = [
                key,
                ...groupedAttributes[attributeGroup],
            ];
            groupedAttributes.summary = groupedAttributes.summary.filter((g) => g !== key);
        }
    }
    consolidateActivityGroups(event, groupedAttributes);
    consolidateSingleItemGroups(groupedAttributes);
    return groupedAttributes;
};
