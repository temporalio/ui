import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        label: string;
        id: string;
        disabled?: boolean;
        position?: 'left' | 'right';
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
export declare type SplitButtonProps = typeof __propDef.props;
export declare type SplitButtonEvents = typeof __propDef.events;
export declare type SplitButtonSlots = typeof __propDef.slots;
export default class SplitButton extends SvelteComponentTyped<SplitButtonProps, SplitButtonEvents, SplitButtonSlots> {
}
export {};
