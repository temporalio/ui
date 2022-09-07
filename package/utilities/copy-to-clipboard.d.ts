import { Writable } from 'svelte/store';
declare type CopiedToClipboardReturnValue = {
    copy: (event: Event, content: string) => Promise<void>;
    copied: Writable<boolean>;
};
export declare const copyToClipboard: (timeout?: number) => CopiedToClipboardReturnValue;
export {};
