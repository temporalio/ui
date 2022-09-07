import { SvelteComponentTyped } from "svelte";
export interface OptionType<T> {
    label: string;
    value: T;
    description?: string;
}
export declare const EMPTY_OPTION: OptionType<string>;
declare class __sveltets_Render<T> {
    props(): {
        value?: T;
        description?: string;
        dark?: boolean;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {
        default: {};
    };
}
export declare type OptionProps<T> = ReturnType<__sveltets_Render<T>['props']>;
export declare type OptionEvents<T> = ReturnType<__sveltets_Render<T>['events']>;
export declare type OptionSlots<T> = ReturnType<__sveltets_Render<T>['slots']>;
export default class Option<T> extends SvelteComponentTyped<OptionProps<T>, OptionEvents<T>, OptionSlots<T>> {
}
export {};
