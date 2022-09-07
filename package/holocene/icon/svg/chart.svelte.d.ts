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
export declare type ChartProps = typeof __propDef.props;
export declare type ChartEvents = typeof __propDef.events;
export declare type ChartSlots = typeof __propDef.slots;
export default class Chart extends SvelteComponentTyped<ChartProps, ChartEvents, ChartSlots> {
}
export {};
