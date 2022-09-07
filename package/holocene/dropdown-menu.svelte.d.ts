import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        id: string;
        position?: 'right' | 'left';
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        trigger: {};
        items: {};
    };
};
export declare type DropdownMenuProps = typeof __propDef.props;
export declare type DropdownMenuEvents = typeof __propDef.events;
export declare type DropdownMenuSlots = typeof __propDef.slots;
export default class DropdownMenu extends SvelteComponentTyped<DropdownMenuProps, DropdownMenuEvents, DropdownMenuSlots> {
}
export {};
