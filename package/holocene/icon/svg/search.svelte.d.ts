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
export declare type SearchProps = typeof __propDef.props;
export declare type SearchEvents = typeof __propDef.events;
export declare type SearchSlots = typeof __propDef.slots;
export default class Search extends SvelteComponentTyped<SearchProps, SearchEvents, SearchSlots> {
}
export {};
