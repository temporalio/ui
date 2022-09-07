import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        feature: string;
        alpha?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type FeatureTagProps = typeof __propDef.props;
export declare type FeatureTagEvents = typeof __propDef.events;
export declare type FeatureTagSlots = typeof __propDef.slots;
export default class FeatureTag extends SvelteComponentTyped<FeatureTagProps, FeatureTagEvents, FeatureTagSlots> {
}
export {};
