import { has } from './has';
export const isSubrowActivity = (event) => {
    return has(event === null || event === void 0 ? void 0 : event.attributes, 'workflowTaskCompletedEventId');
};
