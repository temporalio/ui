import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        rows?: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type TableProps = typeof __propDef.props;
export declare type TableEvents = typeof __propDef.events;
export declare type TableSlots = typeof __propDef.slots;
export default class Table extends SvelteComponentTyped<TableProps, TableEvents, TableSlots> {
}
export {};
