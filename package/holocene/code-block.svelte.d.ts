import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        content: Parameters<typeof JSON.stringify>[0];
        inline?: boolean;
        language?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type CodeBlockProps = typeof __propDef.props;
export declare type CodeBlockEvents = typeof __propDef.events;
export declare type CodeBlockSlots = typeof __propDef.slots;
export default class CodeBlock extends SvelteComponentTyped<CodeBlockProps, CodeBlockEvents, CodeBlockSlots> {
}
export {};
