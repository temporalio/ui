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
export declare type ErrorProps = typeof __propDef.props;
export declare type ErrorEvents = typeof __propDef.events;
export declare type ErrorSlots = typeof __propDef.slots;
export default class Error extends SvelteComponentTyped<ErrorProps, ErrorEvents, ErrorSlots> {
}
export {};
