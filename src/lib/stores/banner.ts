import { persistStore } from '$lib/utilities/persist-store';

export const closedBannerId = persistStore('closedBannerId', null);

export const close = (bannerId: string): void => {
  closedBannerId.set(bannerId);
};
