import { persistStore } from './persist-store';

export const lastUsedNamespace = persistStore<string>('lastNamespace', 'default');
