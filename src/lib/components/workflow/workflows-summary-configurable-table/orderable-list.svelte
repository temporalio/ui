<script lang="ts">
  import {
    workflowTableColumns,
    availableSystemSearchAttributeColumns,
    availableCustomSearchAttributeColumns,
    addColumn,
    removeColumn,
    moveColumn,
    pinColumn,
    MAX_PINNED_COLUMNS,
  } from '$lib/stores/workflow-table-columns';
  import OrderableList from '$lib/holocene/orderable-list/orderable-list.svelte';
  import OrderableListItem from '$lib/holocene/orderable-list/orderable-list-item.svelte';
  import { translate } from '$lib/i18n/translate';

  export let namespace: string;

  $: columnsInUse = $workflowTableColumns?.[namespace] ?? [];
  $: availableSystemColumns = availableSystemSearchAttributeColumns(namespace);
  $: availableCustomColumns = availableCustomSearchAttributeColumns(namespace);
</script>

<div class="flex flex-col gap-4">
  <OrderableList>
    <svelte:fragment slot="heading">
      Workflow Headings <span class="font-normal">(in view)</span>
    </svelte:fragment>
    {#each columnsInUse as { label, pinned }, index (label)}
      <OrderableListItem
        {index}
        {pinned}
        {label}
        totalItems={columnsInUse.length}
        maxPinnedItems={MAX_PINNED_COLUMNS}
        on:moveItem={(event) =>
          moveColumn(event.detail.from, event.detail.to, namespace)}
        on:pinItem={() => pinColumn(label, namespace)}
        on:removeItem={() => removeColumn(label, namespace)}
        addButtonLabel={translate('workflows', 'add-column-label', {
          column: label,
        })}
        removeButtonLabel={translate('workflows', 'remove-column-label', {
          column: label,
        })}
        moveUpButtonLabel={translate('workflows', 'move-column-up-label', {
          column: label,
        })}
        moveDownButtonLabel={translate('workflows', 'move-column-down-label', {
          column: label,
        })}
        pinButtonLabel={translate('workflows', 'pin-column-label', {
          column: label,
        })}
        unpinButtonLabel={translate('workflows', 'unpin-column-label', {
          column: label,
        })}
      />
    {:else}
      <OrderableListItem readonly label="No headings in view" />
    {/each}
  </OrderableList>
  <OrderableList>
    <svelte:fragment slot="heading">
      Available Headings <span class="font-normal">(not in view)</span>
    </svelte:fragment>
    {#each $availableSystemColumns as { label }}
      <OrderableListItem
        static
        on:addItem={() => addColumn(label, namespace)}
        addButtonLabel={translate('workflows', 'add-column-label', {
          column: label,
        })}
        {label}
      />
    {:else}
      <OrderableListItem readonly label="All available headings are in view" />
    {/each}
  </OrderableList>
  <OrderableList>
    <svelte:fragment slot="heading">
      Custom Search Attributes <span class="font-normal">(not in view)</span>
    </svelte:fragment>
    {#each $availableCustomColumns as { label }}
      <OrderableListItem
        static
        on:addItem={() => addColumn(label, namespace)}
        addButtonLabel={translate('workflows', 'add-column-label', {
          column: label,
        })}
        {label}
      />
    {:else}
      <OrderableListItem readonly label="No Custom Search Attributes" />
    {/each}
  </OrderableList>
</div>
