import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        id: string;
        value: SelectOptionValue;
        label?: string;
        dark?: boolean;
        arrow?: boolean;
        name?: string;
        options?: SelectOptionValue[];
    };
    events: {
        change: Event;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type SimpleSelectProps = typeof __propDef.props;
export declare type SimpleSelectEvents = typeof __propDef.events;
export declare type SimpleSelectSlots = typeof __propDef.slots;
export default class SimpleSelect extends SvelteComponentTyped<SimpleSelectProps, SimpleSelectEvents, SimpleSelectSlots> {
}
export {};
