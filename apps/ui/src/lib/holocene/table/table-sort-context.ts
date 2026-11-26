import type { TableSortDirection } from '$lib/utilities/table-sort';

export const TABLE_SORT_CONTEXT = Symbol('table-sort');

export type TableSortContext = {
  isSortable: (column: string) => boolean;
  direction: (column: string) => TableSortDirection | undefined;
  toggle: (column: string) => void;
};
