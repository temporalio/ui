export const toURL = (url, params) => {
    const isURLSearchParams = params instanceof URLSearchParams;
    if (params && !isURLSearchParams)
        params = new URLSearchParams(params);
    if (params)
        return `${url}?${params}`;
    return url;
};
