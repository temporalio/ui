import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        status?: WorkflowExecutionStatus | string;
        delay?: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type WorkflowStatusProps = typeof __propDef.props;
export declare type WorkflowStatusEvents = typeof __propDef.events;
export declare type WorkflowStatusSlots = typeof __propDef.slots;
export default class WorkflowStatus extends SvelteComponentTyped<WorkflowStatusProps, WorkflowStatusEvents, WorkflowStatusSlots> {
}
export {};
