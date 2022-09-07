import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        show: boolean;
        controls: string;
        dark?: boolean;
        disabled?: boolean;
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
export declare type MenuButtonProps = typeof __propDef.props;
export declare type MenuButtonEvents = typeof __propDef.events;
export declare type MenuButtonSlots = typeof __propDef.slots;
export default class MenuButton extends SvelteComponentTyped<MenuButtonProps, MenuButtonEvents, MenuButtonSlots> {
}
export {};
