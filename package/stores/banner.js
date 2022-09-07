import { get } from 'svelte/store';
import { persistStore } from './persist-store';
export const closedBanners = persistStore('closedBanners', null);
export const close = (bannerId) => {
    var _a;
    let banners = (_a = get(closedBanners)) !== null && _a !== void 0 ? _a : [];
    banners = [...banners, bannerId];
    banners = banners.slice(banners.length - 10, banners.length);
    closedBanners.set(banners);
};
