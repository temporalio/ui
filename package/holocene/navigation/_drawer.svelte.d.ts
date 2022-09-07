import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        flyin: boolean;
        flyout: boolean;
        onClose: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type DrawerProps = typeof __propDef.props;
export declare type DrawerEvents = typeof __propDef.events;
export declare type DrawerSlots = typeof __propDef.slots;
export default class Drawer extends SvelteComponentTyped<DrawerProps, DrawerEvents, DrawerSlots> {
}
export {};
