import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        label?: string;
        value: SelectOptionValue;
        options?: SelectOptionValue[];
        parameter?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type FilterSelectProps = typeof __propDef.props;
export declare type FilterSelectEvents = typeof __propDef.events;
export declare type FilterSelectSlots = typeof __propDef.slots;
export default class FilterSelect extends SvelteComponentTyped<FilterSelectProps, FilterSelectEvents, FilterSelectSlots> {
}
export {};
