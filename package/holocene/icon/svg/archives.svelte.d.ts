import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ArchivesProps = typeof __propDef.props;
export declare type ArchivesEvents = typeof __propDef.events;
export declare type ArchivesSlots = typeof __propDef.slots;
export default class Archives extends SvelteComponentTyped<ArchivesProps, ArchivesEvents, ArchivesSlots> {
}
export {};
