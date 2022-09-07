import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        intent?: 'warning' | 'default';
    };
    events: {
        remove: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type ChipProps = typeof __propDef.props;
export declare type ChipEvents = typeof __propDef.events;
export declare type ChipSlots = typeof __propDef.slots;
export default class Chip extends SvelteComponentTyped<ChipProps, ChipEvents, ChipSlots> {
}
export {};
