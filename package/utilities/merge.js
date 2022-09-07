export const merge = (first = {}, second = {}) => {
    const result = { ...first };
    for (const key of Object.keys(second)) {
        const value = result[key];
        if (Array.isArray(value)) {
            result[key] = result[key].concat(second[key]);
        }
        else if (typeof value === 'object' && !Array.isArray(value)) {
            result[key] = merge(result[key], second[key]);
        }
        else {
            result[key] = second[key];
        }
    }
    return result;
};
