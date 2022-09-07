import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        error?: any;
        onError?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type ErrorBoundaryProps = typeof __propDef.props;
export declare type ErrorBoundaryEvents = typeof __propDef.events;
export declare type ErrorBoundarySlots = typeof __propDef.slots;
export default class ErrorBoundary extends SvelteComponentTyped<ErrorBoundaryProps, ErrorBoundaryEvents, ErrorBoundarySlots> {
}
export {};
