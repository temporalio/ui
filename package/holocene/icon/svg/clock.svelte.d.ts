import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ClockProps = typeof __propDef.props;
export declare type ClockEvents = typeof __propDef.events;
export declare type ClockSlots = typeof __propDef.slots;
export default class Clock extends SvelteComponentTyped<ClockProps, ClockEvents, ClockSlots> {
}
export {};
