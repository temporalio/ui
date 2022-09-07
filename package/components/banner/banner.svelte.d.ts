import { SvelteComponentTyped } from "svelte";
import type { BannersState } from '../../../models/banner-state';
declare const __propDef: {
    props: {
        [x: string]: any;
        key: string;
        severity: 'high' | 'medium' | 'low';
        message: string;
        link: string;
        shownBanner: BannersState;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type BannerProps = typeof __propDef.props;
export declare type BannerEvents = typeof __propDef.events;
export declare type BannerSlots = typeof __propDef.slots;
export default class Banner extends SvelteComponentTyped<BannerProps, BannerEvents, BannerSlots> {
}
export {};
