import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        timeline: {};
        default: {};
    };
};
export declare type WorkflowHistoryLayoutProps = typeof __propDef.props;
export declare type WorkflowHistoryLayoutEvents = typeof __propDef.events;
export declare type WorkflowHistoryLayoutSlots = typeof __propDef.slots;
export default class WorkflowHistoryLayout extends SvelteComponentTyped<WorkflowHistoryLayoutProps, WorkflowHistoryLayoutEvents, WorkflowHistoryLayoutSlots> {
}
export {};
