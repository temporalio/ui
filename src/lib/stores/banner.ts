import { get } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';

export const closedBanners = persistStore<string[]>('closedBanners', null);

export const close = (bannerId: string): void => {
  let banners: string[] = get(closedBanners) ?? [];
  banners = [...banners, bannerId];
  banners = banners.slice(banners.length - 10, banners.length);

  closedBanners.set(banners);
};
