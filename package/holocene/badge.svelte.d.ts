import { SvelteComponentTyped } from "svelte";
export declare type BadgeType = 'alpha' | 'beta' | 'warning' | 'error' | 'default' | 'count' | 'active' | 'available' | 'running' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';
declare const __propDef: {
    props: {
        [x: string]: any;
        type?: BadgeType;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type BadgeProps = typeof __propDef.props;
export declare type BadgeEvents = typeof __propDef.events;
export declare type BadgeSlots = typeof __propDef.slots;
export default class Badge extends SvelteComponentTyped<BadgeProps, BadgeEvents, BadgeSlots> {
}
export {};
