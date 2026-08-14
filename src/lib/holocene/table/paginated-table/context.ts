import { getContext, setContext } from 'svelte';

const PAGINATED_TABLE_MAX_HEIGHT = 'paginated-table-max-height';

export const setPaginatedTableMaxHeight = (maxHeight: string): void => {
  setContext(PAGINATED_TABLE_MAX_HEIGHT, maxHeight);
};

export const getPaginatedTableMaxHeight = (): string | undefined => {
  return getContext<string>(PAGINATED_TABLE_MAX_HEIGHT);
};
