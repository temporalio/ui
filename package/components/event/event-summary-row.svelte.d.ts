import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        event: IterableEvent;
        groups: EventGroups;
        visibleItems: IterableEvent[];
        initialItem: IterableEvent;
        compact?: boolean;
        expandAll?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventSummaryRowProps = typeof __propDef.props;
export declare type EventSummaryRowEvents = typeof __propDef.events;
export declare type EventSummaryRowSlots = typeof __propDef.slots;
export default class EventSummaryRow extends SvelteComponentTyped<EventSummaryRowProps, EventSummaryRowEvents, EventSummaryRowSlots> {
}
export {};
