import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        event: IterableEvent;
        compact?: boolean;
        eventGroup: EventGroup | null;
        selectedId: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventDetailsFullProps = typeof __propDef.props;
export declare type EventDetailsFullEvents = typeof __propDef.events;
export declare type EventDetailsFullSlots = typeof __propDef.slots;
export default class EventDetailsFull extends SvelteComponentTyped<EventDetailsFullProps, EventDetailsFullEvents, EventDetailsFullSlots> {
}
export {};
