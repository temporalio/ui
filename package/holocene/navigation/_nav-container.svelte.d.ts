import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        isCloud?: boolean;
        linkList: Partial<Record<string, string>>;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        top: {};
        bottom: {};
        drawer: {};
    };
};
export declare type NavContainerProps = typeof __propDef.props;
export declare type NavContainerEvents = typeof __propDef.events;
export declare type NavContainerSlots = typeof __propDef.slots;
export default class NavContainer extends SvelteComponentTyped<NavContainerProps, NavContainerEvents, NavContainerSlots> {
}
export {};
