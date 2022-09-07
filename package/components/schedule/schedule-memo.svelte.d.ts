import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        notes?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ScheduleMemoProps = typeof __propDef.props;
export declare type ScheduleMemoEvents = typeof __propDef.events;
export declare type ScheduleMemoSlots = typeof __propDef.slots;
export default class ScheduleMemo extends SvelteComponentTyped<ScheduleMemoProps, ScheduleMemoEvents, ScheduleMemoSlots> {
}
export {};
