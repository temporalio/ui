<script lang="ts">
  import { omit } from '$lib/utilities/omit';
  import type { SvelteComponent } from 'svelte';
  import TableHeaderRow from './table-header-row.svelte';
  import TableRow from './table-row.svelte';
  import Table from './table.svelte';

  type T = $$Generic;
  type Item = T & { id: string };

  export let allSelected: boolean = false;
  export let items: Item[];
  export let TableRowChildren: typeof SvelteComponent;

  let selectedItems: Item[] = [];

  let _items = items.map((item) => ({
    ...item,
    selected: false,
  }));

  const handleSelectAll = (event: CustomEvent<{ checked: boolean }>) => {
    allSelected = !allSelected;

    selectedItems = event.detail.checked ? _items : [];

    _items = _items.map((item) => ({
      ...item,
      selected: event.detail.checked,
    }));
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

    allSelected = selectedItems.length === _items.length;
  };

  $: indeterminate =
    selectedItems.length !== 0 && selectedItems.length !== _items.length;
</script>

<slot {selectedItems} />
<Table variant="fancy" class={$$props.class}>
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
  {#each _items as item (item.id)}
    <TableRow
      selectable
      on:change={(event) => handleSelectRow(event, item)}
      bind:selected={item.selected}
    >
      <svelte:component this={TableRowChildren} {...omit(item, 'selected')} />
    </TableRow>
  {/each}
</Table>
