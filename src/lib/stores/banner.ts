import { persistStore } from '$lib/stores/persist-store';

export const closedBannerId = persistStore('closedBannerId', null);

export const close = (bannerId: string): void => {
  closedBannerId.set(bannerId);
};
