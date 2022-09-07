import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        compact?: boolean;
    };
    events: {
        expandAll: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type EventSummaryTableProps = typeof __propDef.props;
export declare type EventSummaryTableEvents = typeof __propDef.events;
export declare type EventSummaryTableSlots = typeof __propDef.slots;
export default class EventSummaryTable extends SvelteComponentTyped<EventSummaryTableProps, EventSummaryTableEvents, EventSummaryTableSlots> {
}
export {};
