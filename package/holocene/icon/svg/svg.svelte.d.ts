import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        width?: number;
        height?: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type SvgProps = typeof __propDef.props;
export declare type SvgEvents = typeof __propDef.events;
export declare type SvgSlots = typeof __propDef.slots;
export default class Svg extends SvelteComponentTyped<SvgProps, SvgEvents, SvgSlots> {
}
export {};
