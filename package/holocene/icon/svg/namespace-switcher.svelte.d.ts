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
export declare type NamespaceSwitcherProps = typeof __propDef.props;
export declare type NamespaceSwitcherEvents = typeof __propDef.events;
export declare type NamespaceSwitcherSlots = typeof __propDef.slots;
export default class NamespaceSwitcher extends SvelteComponentTyped<NamespaceSwitcherProps, NamespaceSwitcherEvents, NamespaceSwitcherSlots> {
}
export {};
