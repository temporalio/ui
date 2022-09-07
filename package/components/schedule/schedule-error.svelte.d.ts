import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        error?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ScheduleErrorProps = typeof __propDef.props;
export declare type ScheduleErrorEvents = typeof __propDef.events;
export declare type ScheduleErrorSlots = typeof __propDef.slots;
export default class ScheduleError extends SvelteComponentTyped<ScheduleErrorProps, ScheduleErrorEvents, ScheduleErrorSlots> {
}
export {};
