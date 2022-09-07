import { SvelteComponentTyped } from "svelte";
import type { ScheduleActionResult } from '$types';
declare const __propDef: {
    props: {
        recentRuns?: ScheduleActionResult[];
        namespace: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ScheduleRecentRunsProps = typeof __propDef.props;
export declare type ScheduleRecentRunsEvents = typeof __propDef.events;
export declare type ScheduleRecentRunsSlots = typeof __propDef.slots;
export default class ScheduleRecentRuns extends SvelteComponentTyped<ScheduleRecentRunsProps, ScheduleRecentRunsEvents, ScheduleRecentRunsSlots> {
}
export {};
