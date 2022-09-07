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
export declare type NavCollapseProps = typeof __propDef.props;
export declare type NavCollapseEvents = typeof __propDef.events;
export declare type NavCollapseSlots = typeof __propDef.slots;
export default class NavCollapse extends SvelteComponentTyped<NavCollapseProps, NavCollapseEvents, NavCollapseSlots> {
}
export {};
