import { SvelteComponentTyped } from "svelte";
import type { IconName } from '$holocene/icon/paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        label: string;
        id: string;
        icon?: IconName;
        readonly?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type DropdownButtonProps = typeof __propDef.props;
export declare type DropdownButtonEvents = typeof __propDef.events;
export declare type DropdownButtonSlots = typeof __propDef.slots;
export default class DropdownButton extends SvelteComponentTyped<DropdownButtonProps, DropdownButtonEvents, DropdownButtonSlots> {
}
export {};
