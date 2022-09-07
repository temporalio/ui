import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        enabled?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
        fallback: {};
    };
};
export declare type FeatureGuardProps = typeof __propDef.props;
export declare type FeatureGuardEvents = typeof __propDef.events;
export declare type FeatureGuardSlots = typeof __propDef.slots;
export default class FeatureGuard extends SvelteComponentTyped<FeatureGuardProps, FeatureGuardEvents, FeatureGuardSlots> {
}
export {};
