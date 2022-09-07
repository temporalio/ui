import { SvelteComponentTyped } from "svelte";
import type { GetPollersResponse } from '../../services/pollers-service';
declare const __propDef: {
    props: {
        namespace: string;
        workflow: WorkflowExecution;
        workers: GetPollersResponse;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type WorkflowHeaderProps = typeof __propDef.props;
export declare type WorkflowHeaderEvents = typeof __propDef.events;
export declare type WorkflowHeaderSlots = typeof __propDef.slots;
export default class WorkflowHeader extends SvelteComponentTyped<WorkflowHeaderProps, WorkflowHeaderEvents, WorkflowHeaderSlots> {
}
export {};
