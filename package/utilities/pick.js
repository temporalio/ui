export const pick = (source, ...keys) => {
    const result = {};
    for (const key of keys) {
        result[key] = source[key];
    }
    return result;
};
