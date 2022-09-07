import { SvelteComponentTyped } from "svelte";
import type { CalendarSpec, IntervalSpec } from '$types';
declare const __propDef: {
    props: {
        calendar: CalendarSpec;
        interval: IntervalSpec;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ScheduleFrequencyProps = typeof __propDef.props;
export declare type ScheduleFrequencyEvents = typeof __propDef.events;
export declare type ScheduleFrequencySlots = typeof __propDef.slots;
export default class ScheduleFrequency extends SvelteComponentTyped<ScheduleFrequencyProps, ScheduleFrequencyEvents, ScheduleFrequencySlots> {
}
export {};
