import { SvelteComponentTyped } from "svelte";
import type { BannersState } from '../../../models/banner-state';
declare const __propDef: {
    props: {
        shownBanner: BannersState;
        uiVersionInfo: UiVersionInfo;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type BannerUiVersionProps = typeof __propDef.props;
export declare type BannerUiVersionEvents = typeof __propDef.events;
export declare type BannerUiVersionSlots = typeof __propDef.slots;
export default class BannerUiVersion extends SvelteComponentTyped<BannerUiVersionProps, BannerUiVersionEvents, BannerUiVersionSlots> {
}
export {};
