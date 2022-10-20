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

  let selectedItemIds: string[] = [];

  let _items = items.map((item) => ({
    ...item,
    selected: false,
  }));

  const handleSelectAll = (event: CustomEvent<{ checked: boolean }>) => {
    allSelected = !allSelected;

    selectedItemIds = event.detail.checked ? _items.map((item) => item.id) : [];

    _items = _items.map((item) => ({
      ...item,
      selected: event.detail.checked,
    }));
  };

  const handleSelectRow = (
    event: CustomEvent<{ checked: boolean }>,
    id: string,
  ) => {
    if (event.detail.checked) {
      selectedItemIds.push(id);
      selectedItemIds = selectedItemIds;
    } else {
      selectedItemIds = selectedItemIds.filter((i) => i !== id);
    }

    allSelected = selectedItemIds.length === _items.length;
  };

  $: indeterminate =
    selectedItemIds.length !== 0 && selectedItemIds.length !== _items.length;
</script>

<slot {selectedItemIds} />
<Table variant="fancy" class={$$props.class}>
  <TableHeaderRow
    slot="headers"
    selectable
    {indeterminate}
    on:change={handleSelectAll}
    bind:selected={allSelected}
  >
    {#if selectedItemIds.length > 0}
      <slot name="bulk-action-headers" />
    {:else}
      <slot name="default-headers" />
    {/if}
  </TableHeaderRow>
  {#each _items as item (item.id)}
    <TableRow
      selectable
      on:change={(event) => handleSelectRow(event, item.id)}
      bind:selected={item.selected}
    >
      <svelte:component this={TableRowChildren} {...omit(item, 'selected')} />
    </TableRow>
  {/each}
</Table>
