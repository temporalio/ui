import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        value: string | undefined;
        left?: boolean;
        right?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type DropdownMenuProps = typeof __propDef.props;
export declare type DropdownMenuEvents = typeof __propDef.events;
export declare type DropdownMenuSlots = typeof __propDef.slots;
export default class DropdownMenu extends SvelteComponentTyped<DropdownMenuProps, DropdownMenuEvents, DropdownMenuSlots> {
}
export {};
