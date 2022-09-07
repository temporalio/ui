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
export declare type UsageProps = typeof __propDef.props;
export declare type UsageEvents = typeof __propDef.events;
export declare type UsageSlots = typeof __propDef.slots;
export default class Usage extends SvelteComponentTyped<UsageProps, UsageEvents, UsageSlots> {
}
export {};
