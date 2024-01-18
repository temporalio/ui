import { persistStore } from '$lib/stores/persist-store';

export const bannerClosed = persistStore<boolean>('bannerClosed', false);
