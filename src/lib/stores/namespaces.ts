import type { DescribeNamespaceResponse } from '$lib/types';
import { writable } from 'svelte/store';
import { persistStore } from './persist-store';

export const lastUsedNamespace = persistStore('lastNamespace', 'default', true);

export const namespaces = writable<DescribeNamespaceResponse[]>([]);
