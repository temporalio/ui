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
export declare type SpinnerSolidProps = typeof __propDef.props;
export declare type SpinnerSolidEvents = typeof __propDef.events;
export declare type SpinnerSolidSlots = typeof __propDef.slots;
export default class SpinnerSolid extends SvelteComponentTyped<SpinnerSolidProps, SpinnerSolidEvents, SpinnerSolidSlots> {
}
export {};
