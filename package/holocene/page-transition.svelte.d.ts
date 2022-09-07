/** @typedef {typeof __propDef.props}  PageTransitionProps */
/** @typedef {typeof __propDef.events}  PageTransitionEvents */
/** @typedef {typeof __propDef.slots}  PageTransitionSlots */
export default class PageTransition extends SvelteComponentTyped<{}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type PageTransitionProps = typeof __propDef.props;
export type PageTransitionEvents = typeof __propDef.events;
export type PageTransitionSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
