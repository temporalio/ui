import { SvelteComponentTyped } from "svelte";
import type { ScheduleListEntry } from '$types';
declare const __propDef: {
    props: {
        schedule: ScheduleListEntry;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type SchedulesTableRowProps = typeof __propDef.props;
export declare type SchedulesTableRowEvents = typeof __propDef.events;
export declare type SchedulesTableRowSlots = typeof __propDef.slots;
export default class SchedulesTableRow extends SvelteComponentTyped<SchedulesTableRowProps, SchedulesTableRowEvents, SchedulesTableRowSlots> {
}
export {};
