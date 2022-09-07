import { SvelteComponentTyped } from "svelte";
import type { IconName } from './icon/paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        intent: 'warning' | 'error' | 'success' | 'info';
        title: string;
        icon?: IconName;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type AlertProps = typeof __propDef.props;
export declare type AlertEvents = typeof __propDef.events;
export declare type AlertSlots = typeof __propDef.slots;
export default class Alert extends SvelteComponentTyped<AlertProps, AlertEvents, AlertSlots> {
}
export {};
