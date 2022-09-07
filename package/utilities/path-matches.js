const dropQueryParameters = (url) => {
    const queryParameterIndex = url === null || url === void 0 ? void 0 : url.indexOf('?');
    if (queryParameterIndex > -1)
        return url.slice(0, queryParameterIndex);
    return url;
};
export const pathMatches = (first, second, exactMatch = false) => {
    const firstSegments = dropQueryParameters(first).split('/');
    const secondSegments = dropQueryParameters(second).split('/');
    if (exactMatch && firstSegments.length !== secondSegments.length) {
        return false;
    }
    for (let index = 0; index < firstSegments.length; index++) {
        const firstSegment = firstSegments[index];
        const secondSegment = secondSegments[index];
        if (firstSegment !== secondSegment)
            return false;
    }
    return true;
};
