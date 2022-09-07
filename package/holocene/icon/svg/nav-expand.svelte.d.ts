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
export declare type NavExpandProps = typeof __propDef.props;
export declare type NavExpandEvents = typeof __propDef.events;
export declare type NavExpandSlots = typeof __propDef.slots;
export default class NavExpand extends SvelteComponentTyped<NavExpandProps, NavExpandEvents, NavExpandSlots> {
}
export {};
