import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type RegionsProps = typeof __propDef.props;
export declare type RegionsEvents = typeof __propDef.events;
export declare type RegionsSlots = typeof __propDef.slots;
export default class Regions extends SvelteComponentTyped<RegionsProps, RegionsEvents, RegionsSlots> {
}
export {};
