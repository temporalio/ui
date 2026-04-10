import type { NamespaceListItem } from '$lib/types/global';

export const sortNamespaces = (
  list: NamespaceListItem[],
): NamespaceListItem[] =>
  [...list].sort((a, b) => a.namespace.localeCompare(b.namespace));
