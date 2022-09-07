import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        dark?: boolean;
        selected?: boolean;
        destructive?: boolean;
        active?: boolean;
        disabled?: boolean;
        href?: string;
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
export declare type MenuItemProps = typeof __propDef.props;
export declare type MenuItemEvents = typeof __propDef.events;
export declare type MenuItemSlots = typeof __propDef.slots;
export default class MenuItem extends SvelteComponentTyped<MenuItemProps, MenuItemEvents, MenuItemSlots> {
}
export {};
