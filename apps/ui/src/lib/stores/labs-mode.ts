import { persistStore } from './persist-store';

export const labsMode = persistStore('labsMode', false, true);
