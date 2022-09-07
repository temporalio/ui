import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        href?: string;
        label: string;
        amount?: number | Long.Long;
        active?: boolean;
        disabled?: boolean;
    };
    events: {
        click: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type TabProps = typeof __propDef.props;
export declare type TabEvents = typeof __propDef.events;
export declare type TabSlots = typeof __propDef.slots;
export default class Tab extends SvelteComponentTyped<TabProps, TabEvents, TabSlots> {
}
export {};
