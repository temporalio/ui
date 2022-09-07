import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        items: IterableEvents;
        groups: EventGroups;
        compact?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventSummaryProps = typeof __propDef.props;
export declare type EventSummaryEvents = typeof __propDef.events;
export declare type EventSummarySlots = typeof __propDef.slots;
export default class EventSummary extends SvelteComponentTyped<EventSummaryProps, EventSummaryEvents, EventSummarySlots> {
}
export {};
