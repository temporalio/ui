import { SvelteComponentTyped } from "svelte";
import type { IconName } from '../../../holocene/icon/paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        icon?: IconName;
        group?: boolean;
        href?: string;
        base?: string;
        active?: boolean;
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
export declare type ToggleButtonProps = typeof __propDef.props;
export declare type ToggleButtonEvents = typeof __propDef.events;
export declare type ToggleButtonSlots = typeof __propDef.slots;
export default class ToggleButton extends SvelteComponentTyped<ToggleButtonProps, ToggleButtonEvents, ToggleButtonSlots> {
}
export {};
