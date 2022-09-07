import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        link?: string | null;
        isCloud: boolean;
        noFilter?: boolean;
        wrap?: boolean;
        externalLink?: boolean;
    };
    events: {
        click: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type NavRowProps = typeof __propDef.props;
export declare type NavRowEvents = typeof __propDef.events;
export declare type NavRowSlots = typeof __propDef.slots;
export default class NavRow extends SvelteComponentTyped<NavRowProps, NavRowEvents, NavRowSlots> {
}
export {};
