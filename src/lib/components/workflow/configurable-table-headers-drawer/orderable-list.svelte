<script lang="ts">
  import type { Readable } from 'svelte/store';

  import { page } from '$app/state';

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
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';

  interface Props {
    table: ConfigurableTableType;
    availableColumns: Readable<ConfigurableTableHeader[]>;
    type: string;
  }

  let { table, availableColumns, type }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const columnsInUse = $derived(
    $configurableTableColumns?.[namespace]?.[table] ?? [],
  );

  const availableCustomColumns = $derived(
    availableCustomSearchAttributeColumns(namespace, table),
  );
</script>

<div class="flex flex-col gap-4">
  <OrderableList>
    {#snippet heading()}
      {type} <span class="font-normal">(in view)</span>
    {/snippet}
    {#each columnsInUse as { label }, index (`${label}:${index}`)}
      <OrderableListItem
        {index}
        {label}
        totalItems={columnsInUse.length}
        on:moveItem={(event) =>
          moveColumn(event.detail.from, event.detail.to, namespace, table)}
        on:removeItem={() => removeColumn(label, namespace, table)}
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
      />
    {:else}
      <OrderableListItem
        readonly
        label={translate('workflows.no-headings-in-view')}
      />
    {/each}
  </OrderableList>
  <OrderableList>
    {#snippet heading()}
      Available Columns <span class="font-normal">(not in view)</span>
    {/snippet}
    {#each $availableColumns as { label } (label)}
      <OrderableListItem
        static
        on:addItem={() => addColumn(label, namespace, table)}
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
  {#if table !== TABLE_TYPE.DEPLOYMENTS}
    <OrderableList>
      {#snippet heading()}
        {translate('events.custom-search-attributes')}
        <span class="font-normal">(not in view)</span>
      {/snippet}
      {#each $availableCustomColumns as { label } (label)}
        <OrderableListItem
          static
          on:addItem={() => addColumn(label, namespace, table)}
          addButtonLabel={translate('workflows.add-column-label', {
            column: label,
          })}
          {label}
        />
      {:else}
        <OrderableListItem readonly label="No Custom Search Attributes" />
      {/each}
    </OrderableList>
  {/if}
</div>
