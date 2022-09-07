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
export declare type CometProps = typeof __propDef.props;
export declare type CometEvents = typeof __propDef.events;
export declare type CometSlots = typeof __propDef.slots;
export default class Comet extends SvelteComponentTyped<CometProps, CometEvents, CometSlots> {
}
export {};
