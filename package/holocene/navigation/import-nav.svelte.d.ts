import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        isCloud: boolean;
        linkList: Partial<Record<string, string>>;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ImportNavProps = typeof __propDef.props;
export declare type ImportNavEvents = typeof __propDef.events;
export declare type ImportNavSlots = typeof __propDef.slots;
export default class ImportNav extends SvelteComponentTyped<ImportNavProps, ImportNavEvents, ImportNavSlots> {
}
export {};
