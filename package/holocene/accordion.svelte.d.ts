import { SvelteComponentTyped } from "svelte";
import type { IconName } from './icon/paths';
declare const __propDef: {
    props: {
        [x: string]: any;
        title: string;
        subtitle?: string;
        icon?: IconName;
        open?: boolean;
        disabled?: boolean;
        readOnly?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type AccordionProps = typeof __propDef.props;
export declare type AccordionEvents = typeof __propDef.events;
export declare type AccordionSlots = typeof __propDef.slots;
export default class Accordion extends SvelteComponentTyped<AccordionProps, AccordionEvents, AccordionSlots> {
}
export {};
