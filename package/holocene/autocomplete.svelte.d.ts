import { SvelteComponentTyped } from "svelte";
import type { IconName } from '../../holocene/icon/paths';
declare const __propDef: {
    props: {
        id: string;
        value: string;
        label?: string;
        placeholder?: string;
        icon?: IconName;
        copyable?: boolean;
        theme?: 'dark' | 'light';
        options: string[];
        onOptionClick: (option: string) => void;
        disabled?: boolean;
    };
    events: {
        input: Event;
        change: Event;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type AutocompleteProps = typeof __propDef.props;
export declare type AutocompleteEvents = typeof __propDef.events;
export declare type AutocompleteSlots = typeof __propDef.slots;
export default class Autocomplete extends SvelteComponentTyped<AutocompleteProps, AutocompleteEvents, AutocompleteSlots> {
}
export {};
