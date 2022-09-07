import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        namespace: string;
        workflowId: string;
        runId: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ExportHistoryProps = typeof __propDef.props;
export declare type ExportHistoryEvents = typeof __propDef.events;
export declare type ExportHistorySlots = typeof __propDef.slots;
export default class ExportHistory extends SvelteComponentTyped<ExportHistoryProps, ExportHistoryEvents, ExportHistorySlots> {
}
export {};
