import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        compact?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventCategoryFilterProps = typeof __propDef.props;
export declare type EventCategoryFilterEvents = typeof __propDef.events;
export declare type EventCategoryFilterSlots = typeof __propDef.slots;
export default class EventCategoryFilter extends SvelteComponentTyped<EventCategoryFilterProps, EventCategoryFilterEvents, EventCategoryFilterSlots> {
}
export {};
