import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        title: string;
        content: string;
        href?: string;
        textSize?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type WorkflowDetailProps = typeof __propDef.props;
export declare type WorkflowDetailEvents = typeof __propDef.events;
export declare type WorkflowDetailSlots = typeof __propDef.slots;
export default class WorkflowDetail extends SvelteComponentTyped<WorkflowDetailProps, WorkflowDetailEvents, WorkflowDetailSlots> {
}
export {};
