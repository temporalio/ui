import { SvelteComponentTyped } from "svelte";
import type { IconName } from '../../holocene/icon/paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        icon?: IconName;
        classes?: string;
        type?: string;
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
export declare type IconButtonProps = typeof __propDef.props;
export declare type IconButtonEvents = typeof __propDef.events;
export declare type IconButtonSlots = typeof __propDef.slots;
export default class IconButton extends SvelteComponentTyped<IconButtonProps, IconButtonEvents, IconButtonSlots> {
}
export {};
