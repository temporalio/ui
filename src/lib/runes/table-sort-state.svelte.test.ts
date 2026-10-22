import { describe, expect, it } from 'vitest';

import { createTableSort } from './table-sort-state.svelte';

describe('createTableSort', () => {
  it('starts unsorted and keeps a sort that is set', () => {
    const cleanup = $effect.root(() => {
      const tableSort = createTableSort(() => {});
      expect(tableSort.value).toBeUndefined();

      tableSort.value = { column: 'Status', direction: 'descending' };
      expect(tableSort.value).toEqual({
        column: 'Status',
        direction: 'descending',
      });
    });
    cleanup();
  });

  it('resets the sort when a watched value changes', () => {
    const cleanup = $effect.root(() => {
      let query = $state('');
      const tableSort = createTableSort(() => query);

      tableSort.value = { column: 'Status', direction: 'ascending' };
      query = 'WorkflowType="a"';

      expect(tableSort.value).toBeUndefined();
    });
    cleanup();
  });
});
