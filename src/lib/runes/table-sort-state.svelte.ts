import type { TableSort } from '$lib/utilities/table-sort';

export function createTableSort(watch: () => void) {
  let sort = $derived.by((): TableSort | undefined => {
    watch();
    return undefined;
  });

  return {
    get value() {
      return sort;
    },
    set value(next: TableSort | undefined) {
      sort = next;
    },
  };
}
