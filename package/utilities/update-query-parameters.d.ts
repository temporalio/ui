import { goto as navigateTo } from '$app/navigation';
import type { invalidate } from '$app/navigation';
declare type UpdateQueryParams = {
    parameter: string;
    value?: string | number | boolean;
    url: URL;
    goto?: typeof navigateTo;
    allowEmpty?: boolean;
    invalidate?: typeof invalidate;
};
export declare const updateQueryParameters: ({ parameter, value, url, goto, allowEmpty, }: UpdateQueryParams) => Promise<string | number | boolean>;
export declare const addHashToURL: (url: URL) => string;
export {};
