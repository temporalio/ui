import { SvelteComponentTyped } from "svelte";
import type { IconName } from '../../holocene/icon/paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        disabled?: boolean;
        loading?: boolean;
        active?: boolean;
        icon?: IconName;
        classes?: string;
        color?: Color;
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
export declare type PillProps = typeof __propDef.props;
export declare type PillEvents = typeof __propDef.events;
export declare type PillSlots = typeof __propDef.slots;
export default class Pill extends SvelteComponentTyped<PillProps, PillEvents, PillSlots> {
}
export {};
