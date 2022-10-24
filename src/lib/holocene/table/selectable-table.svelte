<script lang="ts" context="module">
  export type SelectableTableContext<T> = {
    handleSelectRow: (
      event: CustomEvent<{ checked: boolean }>,
      item: T,
    ) => void;
  };
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import TableHeaderRow from './table-header-row.svelte';
  import Table from './table.svelte';
  import { type ComponentProps, createEventDispatcher } from 'svelte/internal';

  type T = $$Generic;
  type Item = T & { id: string };

  interface $$Props extends ComponentProps<Table> {
    items: Item[];
    class?: string;
  }

  export let items: Item[];

  const dispatch = createEventDispatcher<{
    change: Item[];
  }>();

  let selectedItems: Item[] = [];
  let allSelected: boolean = false;

  const handleSelectAll = (event: CustomEvent<{ checked: boolean }>) => {
    allSelected = !allSelected;

    selectedItems = event.detail.checked ? items : [];

    dispatch('change', selectedItems);
  };

  const handleSelectRow = (
    event: CustomEvent<{ checked: boolean }>,
    item: Item,
  ) => {
    if (event.detail.checked) {
      selectedItems.push(item);
      selectedItems = selectedItems;
    } else {
      selectedItems = selectedItems.filter((i) => i.id !== item.id);
    }

    allSelected = selectedItems.length === items.length;
    dispatch('change', selectedItems);
  };

  $: indeterminate =
    selectedItems.length !== 0 && selectedItems.length !== items.length;

  setContext('selectable-table-context', {
    handleSelectRow,
  });
</script>

<Table variant="fancy" class={$$props.class} {...$$props}>
  <TableHeaderRow
    slot="headers"
    selectable
    {indeterminate}
    on:change={handleSelectAll}
    bind:selected={allSelected}
  >
    {#if selectedItems.length > 0}
      <slot name="bulk-action-headers" />
    {:else}
      <slot name="default-headers" />
    {/if}
  </TableHeaderRow>
  <slot />
</Table>
