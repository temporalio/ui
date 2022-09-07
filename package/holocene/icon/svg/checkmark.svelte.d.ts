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
export declare type CheckmarkProps = typeof __propDef.props;
export declare type CheckmarkEvents = typeof __propDef.events;
export declare type CheckmarkSlots = typeof __propDef.slots;
export default class Checkmark extends SvelteComponentTyped<CheckmarkProps, CheckmarkEvents, CheckmarkSlots> {
}
export {};
