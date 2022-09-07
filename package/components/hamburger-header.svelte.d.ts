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
        action: {};
        links: {};
        user: {};
    };
};
export declare type HamburgerHeaderProps = typeof __propDef.props;
export declare type HamburgerHeaderEvents = typeof __propDef.events;
export declare type HamburgerHeaderSlots = typeof __propDef.slots;
export default class HamburgerHeader extends SvelteComponentTyped<HamburgerHeaderProps, HamburgerHeaderEvents, HamburgerHeaderSlots> {
}
export {};
