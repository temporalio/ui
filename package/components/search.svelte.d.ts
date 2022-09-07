import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        placeholder?: string;
        value?: string;
        label?: string;
        name?: string;
        icon?: boolean;
        id?: string;
    };
    events: {
        submit: SubmitEvent;
        input: Event;
    } & {
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
