import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        value?: SelectOptionValue;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type SimpleOptionProps = typeof __propDef.props;
export declare type SimpleOptionEvents = typeof __propDef.events;
export declare type SimpleOptionSlots = typeof __propDef.slots;
export default class SimpleOption extends SvelteComponentTyped<SimpleOptionProps, SimpleOptionEvents, SimpleOptionSlots> {
}
export {};
