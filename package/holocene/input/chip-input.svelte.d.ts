import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        id: string;
        chips: string[];
        label?: string;
        placeholder?: string;
        name?: string;
        disabled?: boolean;
        required?: boolean;
        hintText?: string;
        validator?: (value: string) => boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ChipInputProps = typeof __propDef.props;
export declare type ChipInputEvents = typeof __propDef.events;
export declare type ChipInputSlots = typeof __propDef.slots;
export default class ChipInput extends SvelteComponentTyped<ChipInputProps, ChipInputEvents, ChipInputSlots> {
}
export {};
