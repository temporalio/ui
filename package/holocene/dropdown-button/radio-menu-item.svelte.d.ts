import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        checked?: boolean;
        value: string;
        name: string;
    };
    events: {
        select: CustomEvent<{
            value: string;
        }>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type RadioMenuItemProps = typeof __propDef.props;
export declare type RadioMenuItemEvents = typeof __propDef.events;
export declare type RadioMenuItemSlots = typeof __propDef.slots;
export default class RadioMenuItem extends SvelteComponentTyped<RadioMenuItemProps, RadioMenuItemEvents, RadioMenuItemSlots> {
}
export {};
