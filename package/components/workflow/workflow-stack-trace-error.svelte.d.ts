import { SvelteComponentTyped } from "svelte";
import type { GetPollersResponse } from '../../../services/pollers-service';
declare const __propDef: {
    props: {
        workflow: WorkflowExecution;
        workers: GetPollersResponse;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type WorkflowStackTraceErrorProps = typeof __propDef.props;
export declare type WorkflowStackTraceErrorEvents = typeof __propDef.events;
export declare type WorkflowStackTraceErrorSlots = typeof __propDef.slots;
export default class WorkflowStackTraceError extends SvelteComponentTyped<WorkflowStackTraceErrorProps, WorkflowStackTraceErrorEvents, WorkflowStackTraceErrorSlots> {
}
export {};
