import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type FilterProps = typeof __propDef.props;
export declare type FilterEvents = typeof __propDef.events;
export declare type FilterSlots = typeof __propDef.slots;
export default class Filter extends SvelteComponentTyped<FilterProps, FilterEvents, FilterSlots> {
}
export {};
