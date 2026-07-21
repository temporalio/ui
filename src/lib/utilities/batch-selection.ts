export type PageSelectionStatus = 'checked' | 'unchecked' | 'partial';

/**
 * Determines the state of a "select visible" checkbox for a page of items.
 *
 * When every item on the page is selected (or everything matching the query is
 * selected via `allSelected`) the status is `checked`; when none are selected
 * it is `unchecked`; otherwise it is `partial` (indeterminate).
 */
export const getPageSelectionStatus = (
  visibleIds: string[],
  selectedIds: Set<string>,
  allSelected: boolean,
): PageSelectionStatus => {
  if (allSelected) return 'checked';
  if (visibleIds.length === 0) return 'unchecked';

  const notSelectedCount = visibleIds.filter(
    (id) => !selectedIds.has(id),
  ).length;

  if (notSelectedCount === visibleIds.length) return 'unchecked';
  if (notSelectedCount === 0) return 'checked';

  return 'partial';
};
