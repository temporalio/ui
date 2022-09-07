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
export declare type FeedProps = typeof __propDef.props;
export declare type FeedEvents = typeof __propDef.events;
export declare type FeedSlots = typeof __propDef.slots;
export default class Feed extends SvelteComponentTyped<FeedProps, FeedEvents, FeedSlots> {
}
export {};
