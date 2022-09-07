import { SvelteComponentTyped } from "svelte";
import type { ScheduleSpec, ScheduleState, SchedulePolicies } from '$types';
declare const __propDef: {
    props: {
        spec: ScheduleSpec;
        state: ScheduleState;
        policies: SchedulePolicies;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ScheduleAdvancedSettingsProps = typeof __propDef.props;
export declare type ScheduleAdvancedSettingsEvents = typeof __propDef.events;
export declare type ScheduleAdvancedSettingsSlots = typeof __propDef.slots;
export default class ScheduleAdvancedSettings extends SvelteComponentTyped<ScheduleAdvancedSettingsProps, ScheduleAdvancedSettingsEvents, ScheduleAdvancedSettingsSlots> {
}
export {};
