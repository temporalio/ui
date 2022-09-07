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
export declare type FileUploadProps = typeof __propDef.props;
export declare type FileUploadEvents = typeof __propDef.events;
export declare type FileUploadSlots = typeof __propDef.slots;
export default class FileUpload extends SvelteComponentTyped<FileUploadProps, FileUploadEvents, FileUploadSlots> {
}
export {};
