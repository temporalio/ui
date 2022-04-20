import { get } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const closedBanners = persistStore('closedBanners', JSON.stringify([]));

export const close = (bannerId: string): void => {
  let banners = JSON.parse(get(closedBanners)) ?? [];
  banners = [...banners, bannerId];
  banners = banners.slice(banners.length - 10, banners.length);

  closedBanners.set(JSON.stringify(banners));
};
