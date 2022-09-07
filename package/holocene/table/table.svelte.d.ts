import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        variant?: 'simple' | 'fancy';
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        headers: {};
        default: {};
    };
};
export declare type TableProps = typeof __propDef.props;
export declare type TableEvents = typeof __propDef.events;
export declare type TableSlots = typeof __propDef.slots;
export default class Table extends SvelteComponentTyped<TableProps, TableEvents, TableSlots> {
}
export {};
