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
export declare type FileImportProps = typeof __propDef.props;
export declare type FileImportEvents = typeof __propDef.events;
export declare type FileImportSlots = typeof __propDef.slots;
export default class FileImport extends SvelteComponentTyped<FileImportProps, FileImportEvents, FileImportSlots> {
}
export {};
