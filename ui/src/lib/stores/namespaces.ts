import type { DescribeNamespaceResponse } from '$types';
import { writable } from 'svelte/store';
import { persistStore } from './persist-store';

export const lastUsedNamespace = persistStore('lastNamespace', 'default');

export const namespaces = writable<DescribeNamespaceResponse[]>([]);
