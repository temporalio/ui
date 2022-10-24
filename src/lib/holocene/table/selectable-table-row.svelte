<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';

  import TableRow from './table-row.svelte';
  import type { SelectableTableContext } from './selectable-table.svelte';

  type T = $$Generic;
  type Item = T & { id: string };

  interface $$Props extends ComponentProps<TableRow> {
    item: Item;
    class?: string;
  }

  export let item: Item;

  const { handleSelectRow } = getContext<SelectableTableContext<Item>>(
    'selectable-table-context',
  );

  const handleChange = (event: CustomEvent<{ checked: boolean }>) => {
    handleSelectRow(event, item);
  };
</script>

<TableRow on:change={handleChange} on:click selectable {...$$props}>
  <slot />
</TableRow>
