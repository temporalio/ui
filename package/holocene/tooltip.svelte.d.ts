import { SvelteComponentTyped } from "svelte";
import type { IconName } from '../../holocene/icon/paths';
declare const __propDef: {
    props: {
        text?: string;
        icon?: IconName;
        top?: boolean;
        topRight?: boolean;
        right?: boolean;
        bottom?: boolean;
        bottomLeft?: boolean;
        bottomRight?: boolean;
        left?: boolean;
        copyable?: boolean;
        hide?: boolean | null;
        width?: number | null;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type TooltipProps = typeof __propDef.props;
export declare type TooltipEvents = typeof __propDef.events;
export declare type TooltipSlots = typeof __propDef.slots;
export default class Tooltip extends SvelteComponentTyped<TooltipProps, TooltipEvents, TooltipSlots> {
}
export {};
