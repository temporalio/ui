import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        namespace: string;
        workflow: WorkflowExecution;
        timeFormat: TimeFormat | string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type WorkflowsSummaryRowProps = typeof __propDef.props;
export declare type WorkflowsSummaryRowEvents = typeof __propDef.events;
export declare type WorkflowsSummaryRowSlots = typeof __propDef.slots;
export default class WorkflowsSummaryRow extends SvelteComponentTyped<WorkflowsSummaryRowProps, WorkflowsSummaryRowEvents, WorkflowsSummaryRowSlots> {
}
export {};
