import { isObject } from './is';
export const has = (target, property) => {
    return Object.prototype.hasOwnProperty.call(target, property);
};
export const hasKeys = (obj) => {
    if (!isObject(obj))
        return false;
    return !!Object.keys(obj).length;
};
