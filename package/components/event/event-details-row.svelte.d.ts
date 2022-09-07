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
export declare type EventDetailsRowProps = typeof __propDef.props;
export declare type EventDetailsRowEvents = typeof __propDef.events;
export declare type EventDetailsRowSlots = typeof __propDef.slots;
export default class EventDetailsRow extends SvelteComponentTyped<EventDetailsRowProps, EventDetailsRowEvents, EventDetailsRowSlots> {
}
export {};
