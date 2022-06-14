import { persistStore } from './persist-store';

export const lastUsedNamespace = persistStore('lastNamespace', 'default');
