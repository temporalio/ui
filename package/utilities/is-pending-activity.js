import { has } from './has';
export const isPendingActivity = (event) => {
    if (event === null)
        return false;
    if (typeof event !== 'object')
        return false;
    if (Array.isArray(event))
        return false;
    if (has(event, 'activityType'))
        return true;
    return false;
};
