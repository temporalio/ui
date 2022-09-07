import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        disabled?: boolean;
        error?: string;
        isValid?: boolean;
        placeholder?: string;
        rows?: number;
        spellcheck?: boolean;
        value: string;
        onBlur?: (e: Event) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        error: {};
    };
};
export declare type TextareaProps = typeof __propDef.props;
export declare type TextareaEvents = typeof __propDef.events;
export declare type TextareaSlots = typeof __propDef.slots;
export default class Textarea extends SvelteComponentTyped<TextareaProps, TextareaEvents, TextareaSlots> {
}
export {};
