import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        key: string;
        value: string | Record<string, unknown>;
        inline?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventDetailsRowExpandedProps = typeof __propDef.props;
export declare type EventDetailsRowExpandedEvents = typeof __propDef.events;
export declare type EventDetailsRowExpandedSlots = typeof __propDef.slots;
export default class EventDetailsRowExpanded extends SvelteComponentTyped<EventDetailsRowExpandedProps, EventDetailsRowExpandedEvents, EventDetailsRowExpandedSlots> {
}
export {};
