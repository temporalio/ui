import { SvelteComponentTyped } from "svelte";
export declare type SelectContext<T> = {
    selectValue: T;
    onChange: (value: T) => void;
};
declare class __sveltets_Render<T> {
    props(): {
        [x: string]: any;
        label?: string;
        id: string;
        value?: T;
        dark?: boolean;
        placeholder?: string;
        disabled?: boolean;
        displayValue?: (value: T) => string | T;
        onChange?: (value: T) => void;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {
        default: {};
    };
}
export declare type SelectProps<T> = ReturnType<__sveltets_Render<T>['props']>;
export declare type SelectEvents<T> = ReturnType<__sveltets_Render<T>['events']>;
export declare type SelectSlots<T> = ReturnType<__sveltets_Render<T>['slots']>;
export default class Select<T> extends SvelteComponentTyped<SelectProps<T>, SelectEvents<T>, SelectSlots<T>> {
}
export {};
