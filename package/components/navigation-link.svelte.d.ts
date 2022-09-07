import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        href: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type NavigationLinkProps = typeof __propDef.props;
export declare type NavigationLinkEvents = typeof __propDef.events;
export declare type NavigationLinkSlots = typeof __propDef.slots;
export default class NavigationLink extends SvelteComponentTyped<NavigationLinkProps, NavigationLinkEvents, NavigationLinkSlots> {
}
export {};
