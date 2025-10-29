import { get } from 'svelte/store';

import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';
import type { DescribeNamespaceResponse } from '$lib/types';

export const getNamespace = (
  namespace: string = get(lastUsedNamespace),
): DescribeNamespaceResponse => {
  return get(namespaces).find((ns) => ns?.namespaceInfo?.name === namespace);
};

export const getNamespaceCapabilities = (namespace?: string) => {
  return getNamespace(namespace)?.namespaceInfo?.capabilities || {};
};

export const namespaceHasReportedProblemsSearchAttribute = (
  namespace?: string,
): boolean => {
  const capabilities = getNamespaceCapabilities(namespace);
  return !!capabilities.reportedProblemsSearchAttribute;
};
