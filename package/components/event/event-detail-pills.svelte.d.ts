import { SvelteComponentTyped } from "svelte";
import { AttributeGrouping } from '../../../utilities/format-event-attributes';
declare const __propDef: {
    props: {
        attributeGrouping: AttributeGrouping;
        activePill: string;
    };
    events: {
        pillChange: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventDetailPillsProps = typeof __propDef.props;
export declare type EventDetailPillsEvents = typeof __propDef.events;
export declare type EventDetailPillsSlots = typeof __propDef.slots;
export default class EventDetailPills extends SvelteComponentTyped<EventDetailPillsProps, EventDetailPillsEvents, EventDetailPillsSlots> {
}
export {};
