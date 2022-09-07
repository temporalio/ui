import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        workflow: WorkflowExecution;
        namespace: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type TerminateWorkflowProps = typeof __propDef.props;
export declare type TerminateWorkflowEvents = typeof __propDef.events;
export declare type TerminateWorkflowSlots = typeof __propDef.slots;
export default class TerminateWorkflow extends SvelteComponentTyped<TerminateWorkflowProps, TerminateWorkflowEvents, TerminateWorkflowSlots> {
}
export {};
