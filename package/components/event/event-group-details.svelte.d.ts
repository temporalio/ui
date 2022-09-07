import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        eventGroup: EventGroup | null;
        selectedId: string;
        onGroupClick: (id: string) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventGroupDetailsProps = typeof __propDef.props;
export declare type EventGroupDetailsEvents = typeof __propDef.events;
export declare type EventGroupDetailsSlots = typeof __propDef.slots;
export default class EventGroupDetails extends SvelteComponentTyped<EventGroupDetailsProps, EventGroupDetailsEvents, EventGroupDetailsSlots> {
}
export {};
