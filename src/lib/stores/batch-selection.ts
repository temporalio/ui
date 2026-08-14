import { derived, type Readable, writable, type Writable } from 'svelte/store';

export type BatchSelectionStore<T> = {
  allSelected: Writable<boolean>;
  selectedItems: Writable<T[]>;
  batchActionsVisible: Readable<boolean>;
  selectItems: (checked: boolean, items: T[]) => void;
  handleSelectAll: (items: T[]) => void;
  reset: () => void;
};

/**
 * Creates the selection state shared by bulk/batch action tables.
 *
 * Selection is additive: calling {@link BatchSelectionStore.selectItems} with a
 * subset of items only adds or removes those items, leaving the rest of the
 * selection untouched. Items are identified by the provided `getId` accessor so
 * the same logic can be reused for any entity (workflows, activities, etc.).
 */
export const createBatchSelection = <T>(
  getId: (item: T) => string,
): BatchSelectionStore<T> => {
  const allSelected = writable<boolean>(false);
  const selectedItems = writable<T[]>([]);
  const batchActionsVisible = derived(
    selectedItems,
    (items) => items.length > 0,
  );

  const selectItems = (checked: boolean, items: T[]): void => {
    selectedItems.update((current) => {
      const selected = new Map(current.map((item) => [getId(item), item]));

      for (const item of items) {
        if (checked) {
          selected.set(getId(item), item);
        } else {
          selected.delete(getId(item));
        }
      }

      return Array.from(selected.values());
    });
  };

  const handleSelectAll = (items: T[]): void => {
    allSelected.set(true);
    selectedItems.set([...items]);
  };

  const reset = (): void => {
    allSelected.set(false);
    selectedItems.set([]);
  };

  return {
    allSelected,
    selectedItems,
    batchActionsVisible,
    selectItems,
    handleSelectAll,
    reset,
  };
};
