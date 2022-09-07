export const getQueryTypesFromError = (message) => {
    const indexOfOpeningBracket = message.indexOf('[');
    const indexOfClosingBracket = message.indexOf(']');
    return message
        .slice(indexOfOpeningBracket + 1, indexOfClosingBracket)
        .split(' ')
        .filter((query) => query !== '__stack_trace')
        .map((query) => {
        if (query.endsWith(',')) {
            return query.slice(0, query.length - 1);
        }
        else {
            return query;
        }
    });
};
