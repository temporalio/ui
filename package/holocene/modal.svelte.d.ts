import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        open?: boolean;
        hideConfirm?: boolean;
        confirmText?: string;
        cancelText?: string;
        confirmType?: 'destructive' | 'primary';
        confirmDisabled?: boolean;
        large?: boolean;
    };
    events: {
        cancelModal: CustomEvent<any>;
        confirmModal: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        title: {};
        content: {};
    };
};
export declare type ModalProps = typeof __propDef.props;
export declare type ModalEvents = typeof __propDef.events;
export declare type ModalSlots = typeof __propDef.slots;
export default class Modal extends SvelteComponentTyped<ModalProps, ModalEvents, ModalSlots> {
}
export {};
