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
export declare type SlidersProps = typeof __propDef.props;
export declare type SlidersEvents = typeof __propDef.events;
export declare type SlidersSlots = typeof __propDef.slots;
export default class Sliders extends SvelteComponentTyped<SlidersProps, SlidersEvents, SlidersSlots> {
}
export {};
