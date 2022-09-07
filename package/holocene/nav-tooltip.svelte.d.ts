import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type NavTooltipProps = typeof __propDef.props;
export declare type NavTooltipEvents = typeof __propDef.events;
export declare type NavTooltipSlots = typeof __propDef.slots;
export default class NavTooltip extends SvelteComponentTyped<NavTooltipProps, NavTooltipEvents, NavTooltipSlots> {
}
export {};
