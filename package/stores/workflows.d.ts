import type { ParsedParameters } from '../../utilities/query/to-list-workflow-parameters';
export declare const refresh: import("svelte/store").Writable<number>;
declare type WorkflowsSearch = {
    parameters: ParsedParameters;
    searchType: 'basic' | 'advanced';
};
export declare const workflowsSearch: import("svelte/store").Writable<WorkflowsSearch>;
export declare const updating: import("svelte/store").Writable<boolean>;
export declare const loading: import("svelte/store").Writable<boolean>;
export declare const workflowError: import("svelte/store").Writable<string>;
export declare const workflows: import("svelte/store").Readable<WorkflowExecution[]>;
export {};
