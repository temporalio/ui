import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        label: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type OptionGroupProps = typeof __propDef.props;
export declare type OptionGroupEvents = typeof __propDef.events;
export declare type OptionGroupSlots = typeof __propDef.slots;
export default class OptionGroup extends SvelteComponentTyped<OptionGroupProps, OptionGroupEvents, OptionGroupSlots> {
}
export {};
