import { handleError as handleRequestError } from './handle-error';
import { toURL } from './to-url';
export declare type TemporalAPIError = {
    code: number;
    message: string;
    details: unknown[];
};
export declare type RetryCallback = (retriesRemaining: number) => void;
export declare type ErrorCallback = (error: {
    status: number;
    statusText: string;
    body: TemporalAPIError;
}) => void;
declare type toURLParams = Parameters<typeof toURL>;
declare type RequestFromAPIOptions = {
    params?: toURLParams[1];
    request?: typeof fetch;
    options?: Parameters<typeof fetch>[1];
    token?: string;
    onRetry?: RetryCallback;
    onError?: ErrorCallback;
    notifyOnError?: boolean;
    handleError?: typeof handleRequestError;
    shouldRetry?: boolean;
    retryInterval?: number;
    isBrowser?: boolean;
};
export declare const isTemporalAPIError: (obj: unknown) => obj is TemporalAPIError;
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
export declare const requestFromAPI: <T>(endpoint: toURLParams[0], init?: RequestFromAPIOptions, retryCount?: number) => Promise<T>;
export {};
