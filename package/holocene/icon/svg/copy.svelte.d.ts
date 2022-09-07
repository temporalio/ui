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
export declare type CopyProps = typeof __propDef.props;
export declare type CopyEvents = typeof __propDef.events;
export declare type CopySlots = typeof __propDef.slots;
export default class Copy extends SvelteComponentTyped<CopyProps, CopyEvents, CopySlots> {
}
export {};
