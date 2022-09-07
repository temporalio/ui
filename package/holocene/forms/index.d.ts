import type { validators } from 'svelte-use-form';
export declare type FormField = {
    key: string;
    label: string;
    required: boolean;
    validations?: typeof validators[];
    hint?: string;
    placeholder?: string;
};
export declare function setBodyProperty(path: string, body: unknown, value: unknown): unknown;
