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
export declare type ScheduleFrequencyPanelProps = typeof __propDef.props;
export declare type ScheduleFrequencyPanelEvents = typeof __propDef.events;
export declare type ScheduleFrequencyPanelSlots = typeof __propDef.slots;
export default class ScheduleFrequencyPanel extends SvelteComponentTyped<ScheduleFrequencyPanelProps, ScheduleFrequencyPanelEvents, ScheduleFrequencyPanelSlots> {
}
export {};
