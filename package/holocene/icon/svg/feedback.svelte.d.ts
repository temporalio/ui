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
export declare type FeedbackProps = typeof __propDef.props;
export declare type FeedbackEvents = typeof __propDef.events;
export declare type FeedbackSlots = typeof __propDef.slots;
export default class Feedback extends SvelteComponentTyped<FeedbackProps, FeedbackEvents, FeedbackSlots> {
}
export {};
