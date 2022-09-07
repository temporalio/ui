import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        checked?: boolean;
        id: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ToggleSwitchProps = typeof __propDef.props;
export declare type ToggleSwitchEvents = typeof __propDef.events;
export declare type ToggleSwitchSlots = typeof __propDef.slots;
export default class ToggleSwitch extends SvelteComponentTyped<ToggleSwitchProps, ToggleSwitchEvents, ToggleSwitchSlots> {
}
export {};
