import { SvelteComponentTyped } from "svelte";
import type { IconName } from '../../../holocene/icon/paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        id: string;
        value: string;
        label?: string;
        icon?: IconName;
        placeholder?: string;
        name?: string;
        copyable?: boolean;
        disabled?: boolean;
        theme?: 'dark' | 'light';
        autocomplete?: boolean;
        valid?: boolean;
        hintText?: string;
        maxLength?: number;
    };
    events: {
        input: Event;
        change: Event;
        focus: FocusEvent;
        blur: FocusEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type InputProps = typeof __propDef.props;
export declare type InputEvents = typeof __propDef.events;
export declare type InputSlots = typeof __propDef.slots;
export default class Input extends SvelteComponentTyped<InputProps, InputEvents, InputSlots> {
}
export {};
