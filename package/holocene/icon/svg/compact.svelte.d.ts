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
export declare type CompactProps = typeof __propDef.props;
export declare type CompactEvents = typeof __propDef.events;
export declare type CompactSlots = typeof __propDef.slots;
export default class Compact extends SvelteComponentTyped<CompactProps, CompactEvents, CompactSlots> {
}
export {};
