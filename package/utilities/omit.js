export const omit = (object, ...keys) => {
    const result = {};
    for (const key of Object.keys(object)) {
        if (!keys.includes(key)) {
            result[key] = object[key];
        }
    }
    return result;
};
