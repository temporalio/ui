import { SvelteComponentTyped } from "svelte";
export declare const dateParameter = "time-format";
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventDateFilterProps = typeof __propDef.props;
export declare type EventDateFilterEvents = typeof __propDef.events;
export declare type EventDateFilterSlots = typeof __propDef.slots;
export default class EventDateFilter extends SvelteComponentTyped<EventDateFilterProps, EventDateFilterEvents, EventDateFilterSlots> {
}
export {};
