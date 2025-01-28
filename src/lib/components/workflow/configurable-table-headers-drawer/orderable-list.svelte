<script lang="ts">
  import type { Readable } from 'svelte/store';

  import { page } from '$app/stores';

  import OrderableListItem from '$lib/holocene/orderable-list/orderable-list-item.svelte';
  import OrderableList from '$lib/holocene/orderable-list/orderable-list.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    addColumn,
    availableCustomSearchAttributeColumns,
    configurableTableColumns,
    type ConfigurableTableHeader,
    type ConfigurableTableType,
    moveColumn,
    removeColumn,
  } from '$lib/stores/configurable-table-columns';

  export let table: ConfigurableTableType;
  export let availableColumns: Readable<ConfigurableTableHeader[]>;
  export let type: string;

  $: namespace = $page.params.namespace;
  $: columnsInUse = $configurableTableColumns?.[namespace]?.[table] ?? [];
  $: availableCustomColumns = availableCustomSearchAttributeColumns(
    namespace,
    table,
  );
</script>

<div class="flex flex-col gap-4">
  <OrderableList>
    <svelte:fragment slot="heading">
      {type} Headings <span class="font-normal">(in view)</span>
    </svelte:fragment>
    {#each columnsInUse as { label }, index (label)}
      <OrderableListItem
        {index}
        {label}
        totalItems={columnsInUse.length}
        moveItem={({ from, to }) => moveColumn(from, to, namespace, table)}
        removeItem={() => removeColumn(label, namespace, table)}
        addButtonLabel={translate('workflows.add-column-label', {
          column: label,
        })}
        removeButtonLabel={translate('workflows.remove-column-label', {
          column: label,
        })}
        moveUpButtonLabel={translate('workflows.move-column-up-label', {
          column: label,
        })}
        moveDownButtonLabel={translate('workflows.move-column-down-label', {
          column: label,
        })}
        pinButtonLabel={translate('workflows.pin-column-label', {
          column: label,
        })}
        unpinButtonLabel={translate('workflows.unpin-column-label', {
          column: label,
        })}
      />
    {:else}
      <OrderableListItem
        readonly
        label={translate('workflows.no-headings-in-view')}
      />
    {/each}
  </OrderableList>
  <OrderableList>
    <svelte:fragment slot="heading">
      Available Headings <span class="font-normal">(not in view)</span>
    </svelte:fragment>
    {#each $availableColumns as { label }}
      <OrderableListItem
        static
        addItem={() => addColumn(label, namespace, table)}
        addButtonLabel={translate('workflows.add-column-label', {
          column: label,
        })}
        {label}
      />
    {:else}
      <OrderableListItem
        readonly
        label={translate('workflows.all-headings-in-view')}
      />
    {/each}
  </OrderableList>
  <OrderableList>
    <svelte:fragment slot="heading">
      {translate('events.custom-search-attributes')}
      <span class="font-normal">(not in view)</span>
    </svelte:fragment>
    {#each $availableCustomColumns as { label }}
      <OrderableListItem
        static
        addItem={() => addColumn(label, namespace, table)}
        addButtonLabel={translate('workflows.add-column-label', {
          column: label,
        })}
        {label}
      />
    {:else}
      <OrderableListItem readonly label="No Custom Search Attributes" />
    {/each}
  </OrderableList>
</div>
