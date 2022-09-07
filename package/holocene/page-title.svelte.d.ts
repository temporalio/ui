/** @typedef {typeof __propDef.props}  PageTitleProps */
/** @typedef {typeof __propDef.events}  PageTitleEvents */
/** @typedef {typeof __propDef.slots}  PageTitleSlots */
export default class PageTitle extends SvelteComponentTyped<{
    url?: string;
    title?: string;
    image?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type PageTitleProps = typeof __propDef.props;
export type PageTitleEvents = typeof __propDef.events;
export type PageTitleSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        url?: string;
        title?: string;
        image?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
