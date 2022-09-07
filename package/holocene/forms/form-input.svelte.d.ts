import { SvelteComponentTyped } from "svelte";
import type { FormField } from '$holocene/forms';
declare const __propDef: {
    props: {
        field: FormField;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type FormInputProps = typeof __propDef.props;
export declare type FormInputEvents = typeof __propDef.events;
export declare type FormInputSlots = typeof __propDef.slots;
export default class FormInput extends SvelteComponentTyped<FormInputProps, FormInputEvents, FormInputSlots> {
}
export {};
