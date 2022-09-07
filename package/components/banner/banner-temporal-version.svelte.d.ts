import { SvelteComponentTyped } from "svelte";
import type { BannersState } from '../../../models/banner-state';
declare const __propDef: {
    props: {
        shownBanner: BannersState;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type BannerTemporalVersionProps = typeof __propDef.props;
export declare type BannerTemporalVersionEvents = typeof __propDef.events;
export declare type BannerTemporalVersionSlots = typeof __propDef.slots;
export default class BannerTemporalVersion extends SvelteComponentTyped<BannerTemporalVersionProps, BannerTemporalVersionEvents, BannerTemporalVersionSlots> {
}
export {};
