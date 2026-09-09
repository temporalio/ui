import { derived, writable } from 'svelte/store';

import { page } from '$app/stores';

import {
  advancedVisibilityEnabled,
  advancedVisibilityEnabledWithOrderBy,
} from '$lib/utilities/advanced-visibility-enabled';

import { cluster } from './cluster';
import { temporalVersion } from './versions';

export const isCloud = derived(
  [page],
  ([$page]) => $page.data?.settings?.runtimeEnvironment?.isCloud,
);

export const supportsAdvancedVisibility = derived(
  [cluster, temporalVersion, isCloud],
  ([$cluster, $temporalVersion, $isCloud]) =>
    advancedVisibilityEnabled($cluster, $temporalVersion) || $isCloud,
);

const orderByClauseRejectedNamespaces = writable<string[]>([]);

export const rejectOrderByClause = (namespace: string) => {
  orderByClauseRejectedNamespaces.update((namespaces) =>
    namespaces.includes(namespace) ? namespaces : [...namespaces, namespace],
  );
};

export const orderByClauseRejected = derived(
  [page, orderByClauseRejectedNamespaces],
  ([$page, $orderByClauseRejectedNamespaces]) =>
    $orderByClauseRejectedNamespaces.includes($page.params?.namespace),
);

export const workflowSortingEnabled = derived(
  [page],
  ([$page]) => !!$page.data?.settings?.workflowSortingEnabled,
);

export const supportsAdvancedVisibilityWithOrderBy = derived(
  [cluster, isCloud, orderByClauseRejected, workflowSortingEnabled],
  ([$cluster, $isCloud, $orderByClauseRejected, $workflowSortingEnabled]) =>
    $workflowSortingEnabled &&
    !$isCloud &&
    !$orderByClauseRejected &&
    advancedVisibilityEnabledWithOrderBy($cluster),
);
