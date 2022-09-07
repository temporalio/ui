import { Writable } from 'svelte/store';
declare type SearchParameterValue = string | number | boolean | null;
export declare const searchParameter: (parameter: string, defaultValue: SearchParameterValue, persist?: boolean) => Writable<SearchParameterValue>;
export {};
