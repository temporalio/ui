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

/**
 * Resolves which items a batch-selection checkbox click should target.
 *
 * Returns `null` when the event did not originate from a checkbox input. This
 * guard is required because the underlying Checkbox component derives its
 * onclick type from Svelte event forwarding and does not narrow the current
 * event target to a checkbox input.
 *
 * Otherwise returns the checkbox's `checked` state and the targeted items: a
 * single item, or the inclusive range from the previously clicked index when
 * the click was shift-clicked.
 */
export const getBatchSelectionTargets = <T>(
  event: MouseEvent,
  items: T[],
  index: number,
  prevClickedIndex: number | null,
): { isChecked: boolean; targeted: T[] } | null => {
  if (!(event.currentTarget instanceof HTMLInputElement)) {
    return null;
  }

  const isChecked = event.currentTarget.checked;

  if (event.shiftKey && prevClickedIndex !== null && prevClickedIndex >= 0) {
    const rangeStartInclusive = Math.min(prevClickedIndex, index);
    const rangeEndInclusive = Math.max(prevClickedIndex, index);

    return {
      isChecked,
      targeted: items.slice(rangeStartInclusive, rangeEndInclusive + 1),
    };
  }

  return { isChecked, targeted: [items[index]] };
};
