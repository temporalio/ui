import { SvelteComponentTyped } from "svelte";
import type { IconName } from '$holocene/icon/paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        disabled?: boolean;
        variant?: 'primary' | 'secondary' | 'destructive' | 'login' | 'link';
        thin?: boolean;
        loading?: boolean;
        href?: string;
        target?: '_self' | '_external';
        active?: boolean;
        large?: boolean;
        as?: 'button' | 'anchor';
        icon?: IconName;
        classes?: string;
        dataCy?: string;
        count?: number;
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
export declare type ButtonProps = typeof __propDef.props;
export declare type ButtonEvents = typeof __propDef.events;
export declare type ButtonSlots = typeof __propDef.slots;
export default class Button extends SvelteComponentTyped<ButtonProps, ButtonEvents, ButtonSlots> {
}
export {};
