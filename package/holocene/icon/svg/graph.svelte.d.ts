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
export declare type GraphProps = typeof __propDef.props;
export declare type GraphEvents = typeof __propDef.events;
export declare type GraphSlots = typeof __propDef.slots;
export default class Graph extends SvelteComponentTyped<GraphProps, GraphEvents, GraphSlots> {
}
export {};
