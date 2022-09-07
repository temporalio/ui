import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        delay?: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type HeartBeatIndicatorProps = typeof __propDef.props;
export declare type HeartBeatIndicatorEvents = typeof __propDef.events;
export declare type HeartBeatIndicatorSlots = typeof __propDef.slots;
export default class HeartBeatIndicator extends SvelteComponentTyped<HeartBeatIndicatorProps, HeartBeatIndicatorEvents, HeartBeatIndicatorSlots> {
}
export {};
