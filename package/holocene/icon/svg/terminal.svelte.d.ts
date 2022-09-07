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
export declare type TerminalProps = typeof __propDef.props;
export declare type TerminalEvents = typeof __propDef.events;
export declare type TerminalSlots = typeof __propDef.slots;
export default class Terminal extends SvelteComponentTyped<TerminalProps, TerminalEvents, TerminalSlots> {
}
export {};
