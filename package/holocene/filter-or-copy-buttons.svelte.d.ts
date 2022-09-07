import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        show?: boolean;
        filterable?: boolean;
        copyable?: boolean;
        content: string;
        onFilter?: () => void;
        filtered?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type FilterOrCopyButtonsProps = typeof __propDef.props;
export declare type FilterOrCopyButtonsEvents = typeof __propDef.events;
export declare type FilterOrCopyButtonsSlots = typeof __propDef.slots;
export default class FilterOrCopyButtons extends SvelteComponentTyped<FilterOrCopyButtonsProps, FilterOrCopyButtonsEvents, FilterOrCopyButtonsSlots> {
}
export {};
