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
export declare type AddProps = typeof __propDef.props;
export declare type AddEvents = typeof __propDef.events;
export declare type AddSlots = typeof __propDef.slots;
export default class Add extends SvelteComponentTyped<AddProps, AddEvents, AddSlots> {
}
export {};
