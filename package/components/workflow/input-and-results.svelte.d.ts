import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        type: 'input' | 'results';
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type InputAndResultsProps = typeof __propDef.props;
export declare type InputAndResultsEvents = typeof __propDef.events;
export declare type InputAndResultsSlots = typeof __propDef.slots;
export default class InputAndResults extends SvelteComponentTyped<InputAndResultsProps, InputAndResultsEvents, InputAndResultsSlots> {
}
export {};
