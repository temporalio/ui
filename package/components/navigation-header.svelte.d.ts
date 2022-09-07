import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        href: string;
        user: User;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        logo: {};
        links: {};
        user: {};
    };
};
export declare type NavigationHeaderProps = typeof __propDef.props;
export declare type NavigationHeaderEvents = typeof __propDef.events;
export declare type NavigationHeaderSlots = typeof __propDef.slots;
export default class NavigationHeader extends SvelteComponentTyped<NavigationHeaderProps, NavigationHeaderEvents, NavigationHeaderSlots> {
}
export {};
