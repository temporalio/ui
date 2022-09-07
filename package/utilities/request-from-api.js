import { browser } from '$app/env';
import { noop } from 'svelte/internal';
import { handleError as handleRequestError } from './handle-error';
import { isFunction } from './is-function';
import { toURL } from './to-url';
export const isTemporalAPIError = (obj) => (obj === null || obj === void 0 ? void 0 : obj.message) !== undefined &&
    typeof (obj === null || obj === void 0 ? void 0 : obj.message) === 'string';
/**
 *  A utility method for making requests to the Temporal API.
 *
 * @param endpoint The path of the API endpoint you want to request data from.
 *
 * @param options.params Query (or search) parameters to be suffixed to the
 * path.
 * @param options.token Shorthand for a `nextPageToken` query parameter.
 * @param options.request A replacement for the native `fetch` function.
 *
 * @returns Promise with the response from the API parsed into an object.
 */
export const requestFromAPI = async (endpoint, init = {}, retryCount = 10) => {
    var _a;
    const { params = {}, request = fetch, token, shouldRetry = false, notifyOnError = true, handleError = handleRequestError, onRetry = noop, onError, retryInterval = 5000, isBrowser = browser, } = init;
    let { options } = init;
    const nextPageToken = token ? { next_page_token: token } : {};
    const query = new URLSearchParams({
        ...params,
        ...nextPageToken,
    });
    const url = toURL(endpoint, query);
    try {
        options = withSecurityOptions(options, isBrowser);
        if (globalThis === null || globalThis === void 0 ? void 0 : globalThis.AccessToken) {
            options.headers = await withBearerToken(options === null || options === void 0 ? void 0 : options.headers, globalThis.AccessToken, isBrowser);
        }
        const response = await request(url, options);
        const body = await response.json();
        const { status, statusText } = response;
        if (!response.ok) {
            if (onError && isFunction(onError)) {
                onError({ status, statusText, body });
            }
            else {
                throw {
                    statusCode: response.status,
                    statusText: response.statusText,
                    response,
                    message: (_a = body === null || body === void 0 ? void 0 : body.message) !== null && _a !== void 0 ? _a : response.statusText,
                };
            }
        }
        return body;
    }
    catch (error) {
        if (notifyOnError) {
            handleError(error);
            if (shouldRetry && retryCount > 0) {
                return new Promise((resolve) => {
                    const retriesRemaining = retryCount - 1;
                    onRetry(retriesRemaining);
                    setTimeout(() => {
                        resolve(requestFromAPI(endpoint, init, retriesRemaining));
                    }, retryInterval);
                });
            }
        }
        else {
            throw error;
        }
    }
};
const withSecurityOptions = (options, isBrowser = browser) => {
    const opts = { credentials: 'include', ...options };
    opts.headers = withCsrf(options === null || options === void 0 ? void 0 : options.headers, isBrowser);
    return opts;
};
const withBearerToken = async (headers, accessToken, isBrowser = browser) => {
    // At this point in the code path, headers will always be set.
    /* c8 ignore next */
    if (!headers)
        headers = {};
    if (!isBrowser)
        return headers;
    try {
        const token = await accessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        /* c8 ignore next 4 */
    }
    catch (e) {
        console.error(e);
    }
    return headers;
};
const withCsrf = (headers, isBrowser = browser) => {
    if (!headers)
        headers = {};
    if (!isBrowser)
        return headers;
    const csrfCookie = '_csrf=';
    const csrfHeader = 'X-CSRF-TOKEN';
    try {
        const cookies = document.cookie.split(';');
        let csrf = cookies.find((c) => c.includes(csrfCookie));
        if (csrf && !headers[csrfHeader]) {
            csrf = csrf.trim().slice(csrfCookie.length);
            headers[csrfHeader] = csrf;
        }
        /* c8 ignore next 4 */
    }
    catch (error) {
        console.error(error);
    }
    return headers;
};
