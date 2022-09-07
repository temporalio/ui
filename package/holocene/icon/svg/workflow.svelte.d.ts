import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type WorkflowProps = typeof __propDef.props;
export declare type WorkflowEvents = typeof __propDef.events;
export declare type WorkflowSlots = typeof __propDef.slots;
export default class Workflow extends SvelteComponentTyped<WorkflowProps, WorkflowEvents, WorkflowSlots> {
}
export {};
