<script lang="ts">
  import {
    workflowTableColumns,
    availableWorkflowColumns,
    availableSearchAttributeColumns,
    addColumn,
    removeColumn,
    moveColumn,
    pinColumn,
    MAX_PINNED_COLUMNS,
  } from '$lib/stores/workflow-table-columns';
  import OrderableList from '$lib/holocene/orderable-list/orderable-list.svelte';
  import OrderableListItem from '$lib/holocene/orderable-list/orderable-list-item.svelte';
</script>

<div class="flex flex-col gap-4">
  <OrderableList>
    <svelte:fragment slot="heading">
      Workflow Headings <span class="font-normal">(in view)</span>
    </svelte:fragment>
    {#each $workflowTableColumns as { label, pinned }, index (label)}
      <OrderableListItem
        {index}
        {pinned}
        {label}
        totalItems={$workflowTableColumns.length}
        maxPinnedItems={MAX_PINNED_COLUMNS}
        on:moveItem={(event) => moveColumn(event.detail.from, event.detail.to)}
        on:pinItem={() => pinColumn(label)}
        on:removeItem={() => removeColumn(label)}
      />
    {:else}
      <OrderableListItem readonly label="No headings in view" />
    {/each}
  </OrderableList>
  <OrderableList>
    <svelte:fragment slot="heading">
      Available Headings <span class="font-normal">(not in view)</span>
    </svelte:fragment>
    {#each $availableWorkflowColumns as { label }}
      <OrderableListItem static on:addItem={() => addColumn(label)} {label} />
    {:else}
      <OrderableListItem label="All available headings are in view" />
    {/each}
  </OrderableList>
  <OrderableList>
    <svelte:fragment slot="heading">
      Custom Search Attributes <span class="font-normal">(not in view)</span>
    </svelte:fragment>
    {#each $availableSearchAttributeColumns as { label }}
      <OrderableListItem static on:addItem={() => addColumn(label)} {label} />
    {:else}
      <OrderableListItem readonly label="No Custom Search Attributes" />
    {/each}
  </OrderableList>
</div>
