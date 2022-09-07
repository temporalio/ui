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
export declare type DownloadProps = typeof __propDef.props;
export declare type DownloadEvents = typeof __propDef.events;
export declare type DownloadSlots = typeof __propDef.slots;
export default class Download extends SvelteComponentTyped<DownloadProps, DownloadEvents, DownloadSlots> {
}
export {};
