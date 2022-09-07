import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        showSettings: boolean;
        accessToken: string;
        onCancel: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type DataEncoderSettingsProps = typeof __propDef.props;
export declare type DataEncoderSettingsEvents = typeof __propDef.events;
export declare type DataEncoderSettingsSlots = typeof __propDef.slots;
export default class DataEncoderSettings extends SvelteComponentTyped<DataEncoderSettingsProps, DataEncoderSettingsEvents, DataEncoderSettingsSlots> {
}
export {};
