import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        id: string;
        show?: boolean;
        dark?: boolean;
        position?: 'left' | 'right';
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type MenuProps = typeof __propDef.props;
export declare type MenuEvents = typeof __propDef.events;
export declare type MenuSlots = typeof __propDef.slots;
export default class Menu extends SvelteComponentTyped<MenuProps, MenuEvents, MenuSlots> {
}
export {};
