import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        content: string;
        visible?: boolean;
        color?: string;
        clickAllToCopy?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type CopyableProps = typeof __propDef.props;
export declare type CopyableEvents = typeof __propDef.events;
export declare type CopyableSlots = typeof __propDef.slots;
export default class Copyable extends SvelteComponentTyped<CopyableProps, CopyableEvents, CopyableSlots> {
}
export {};
