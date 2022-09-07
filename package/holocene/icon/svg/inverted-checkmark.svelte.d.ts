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
export declare type InvertedCheckmarkProps = typeof __propDef.props;
export declare type InvertedCheckmarkEvents = typeof __propDef.events;
export declare type InvertedCheckmarkSlots = typeof __propDef.slots;
export default class InvertedCheckmark extends SvelteComponentTyped<InvertedCheckmarkProps, InvertedCheckmarkEvents, InvertedCheckmarkSlots> {
}
export {};
