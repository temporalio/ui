import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        id: string;
        checked?: boolean;
        label?: string;
        onDark?: boolean;
        indeterminate?: boolean;
        disabled?: boolean;
    };
    events: {
        change: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type CheckboxProps = typeof __propDef.props;
export declare type CheckboxEvents = typeof __propDef.events;
export declare type CheckboxSlots = typeof __propDef.slots;
export default class Checkbox extends SvelteComponentTyped<CheckboxProps, CheckboxEvents, CheckboxSlots> {
}
export {};
