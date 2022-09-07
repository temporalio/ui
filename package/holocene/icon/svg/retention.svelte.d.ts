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
export declare type RetentionProps = typeof __propDef.props;
export declare type RetentionEvents = typeof __propDef.events;
export declare type RetentionSlots = typeof __propDef.slots;
export default class Retention extends SvelteComponentTyped<RetentionProps, RetentionEvents, RetentionSlots> {
}
export {};
