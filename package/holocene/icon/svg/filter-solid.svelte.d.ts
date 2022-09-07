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
export declare type FilterSolidProps = typeof __propDef.props;
export declare type FilterSolidEvents = typeof __propDef.events;
export declare type FilterSolidSlots = typeof __propDef.slots;
export default class FilterSolid extends SvelteComponentTyped<FilterSolidProps, FilterSolidEvents, FilterSolidSlots> {
}
export {};
