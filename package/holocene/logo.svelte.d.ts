import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        width?: string;
        height?: string;
        isCloud: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type LogoProps = typeof __propDef.props;
export declare type LogoEvents = typeof __propDef.events;
export declare type LogoSlots = typeof __propDef.slots;
export default class Logo extends SvelteComponentTyped<LogoProps, LogoEvents, LogoSlots> {
}
export {};
