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
export declare type HyphenProps = typeof __propDef.props;
export declare type HyphenEvents = typeof __propDef.events;
export declare type HyphenSlots = typeof __propDef.slots;
export default class Hyphen extends SvelteComponentTyped<HyphenProps, HyphenEvents, HyphenSlots> {
}
export {};
