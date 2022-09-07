import { SvelteComponentTyped } from "svelte";
import { type IconName } from './paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        name: IconName;
        width?: number;
        height?: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type IconProps = typeof __propDef.props;
export declare type IconEvents = typeof __propDef.events;
export declare type IconSlots = typeof __propDef.slots;
export default class Icon extends SvelteComponentTyped<IconProps, IconEvents, IconSlots> {
}
export {};
