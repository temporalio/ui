import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        error?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type PanelProps = typeof __propDef.props;
export declare type PanelEvents = typeof __propDef.events;
export declare type PanelSlots = typeof __propDef.slots;
export default class Panel extends SvelteComponentTyped<PanelProps, PanelEvents, PanelSlots> {
}
export {};
