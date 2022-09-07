import { SvelteComponentTyped } from "svelte";
import { Writable } from 'svelte/store';
interface Toast {
    message: string;
    variant: 'success' | 'error' | 'info' | 'warning' | 'primary';
    id?: string;
    duration?: number;
}
interface Toaster {
    push: (toast: Toast) => void;
    pop: (id: string) => void;
    toasts: Writable<Toast[]>;
}
export declare const toaster: Toaster;
declare const __propDef: {
    props: {
        pop: Toaster['pop'];
        toasts: Toaster['toasts'];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ToasterProps = typeof __propDef.props;
export declare type ToasterEvents = typeof __propDef.events;
export declare type ToasterSlots = typeof __propDef.slots;
export default class Toaster extends SvelteComponentTyped<ToasterProps, ToasterEvents, ToasterSlots> {
}
export {};
