import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        searchType: 'basic' | 'advanced';
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type WorkflowFiltersProps = typeof __propDef.props;
export declare type WorkflowFiltersEvents = typeof __propDef.events;
export declare type WorkflowFiltersSlots = typeof __propDef.slots;
export default class WorkflowFilters extends SvelteComponentTyped<WorkflowFiltersProps, WorkflowFiltersEvents, WorkflowFiltersSlots> {
}
export {};
