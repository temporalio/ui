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
export declare type NamespaceProps = typeof __propDef.props;
export declare type NamespaceEvents = typeof __propDef.events;
export declare type NamespaceSlots = typeof __propDef.slots;
export default class Namespace extends SvelteComponentTyped<NamespaceProps, NamespaceEvents, NamespaceSlots> {
}
export {};
