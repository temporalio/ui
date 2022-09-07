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
export declare type LockProps = typeof __propDef.props;
export declare type LockEvents = typeof __propDef.events;
export declare type LockSlots = typeof __propDef.slots;
export default class Lock extends SvelteComponentTyped<LockProps, LockEvents, LockSlots> {
}
export {};
