import type { Form } from 'svelte-use-form';
import type { FormField } from '$holocene/forms';
export declare const fields: Record<string, FormField>;
export declare const submitScheduleForm: (form: Form, namespace: string) => Promise<void>;
export declare const loading: import("svelte/store").Writable<boolean>;
export declare const error: import("svelte/store").Writable<string>;
