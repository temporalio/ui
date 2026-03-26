import { namespaces as namespacesStore } from '$lib/stores/namespaces';
import type { DescribeNamespaceResponse } from '$lib/types';

let _list = $state<DescribeNamespaceResponse[]>([]);

export const namespaceState = {
  get list() {
    return _list;
  },

  get names(): string[] {
    return _list
      .map((ns) => ns.namespaceInfo?.name)
      .filter((name): name is string => Boolean(name));
  },

  hydrate(data: DescribeNamespaceResponse[]) {
    _list = data;
    namespacesStore.set(data);
  },

  search(query: string): string[] {
    const names = this.names;
    if (!query) return names;
    return names.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase()),
    );
  },
};
