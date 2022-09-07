import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        uiVersionInfo: UiVersionInfo;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type BannersProps = typeof __propDef.props;
export declare type BannersEvents = typeof __propDef.events;
export declare type BannersSlots = typeof __propDef.slots;
export default class Banners extends SvelteComponentTyped<BannersProps, BannersEvents, BannersSlots> {
}
export {};
