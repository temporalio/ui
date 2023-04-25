<script lang="ts">
  import {
    workflowTableColumns,
    availableWorkflowColumns,
    availableSearchAttributes,
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
        totalItems={$workflowTableColumns.length}
        maxPinnedItems={MAX_PINNED_COLUMNS}
        on:moveItem={(event) => moveColumn(event.detail.from, event.detail.to)}
        on:pinItem={() => pinColumn(label)}
        on:removeItem={() => removeColumn(label)}
      >
        {label}
      </OrderableListItem>
    {:else}
      <OrderableListItem readonly>No headings in view</OrderableListItem>
    {/each}
  </OrderableList>
  <OrderableList>
    <svelte:fragment slot="heading">
      Available Headings <span class="font-normal">(not in view)</span>
    </svelte:fragment>
    {#each $availableWorkflowColumns as { label }, index}
      <OrderableListItem static {index} on:addItem={() => addColumn(label)}>
        {label}
      </OrderableListItem>
    {:else}
      <OrderableListItem readonly
        >All available headings are in view</OrderableListItem
      >
    {/each}
  </OrderableList>
  <OrderableList>
    <svelte:fragment slot="heading">
      Custom Search Attributes <span class="font-normal">(not in view)</span>
    </svelte:fragment>
    {#each $availableSearchAttributes as { label }, index}
      <OrderableListItem static {index} on:addItem={() => addColumn(label)}>
        {label}
      </OrderableListItem>
    {:else}
      <OrderableListItem readonly>No Custom Search Attributes</OrderableListItem
      >
    {/each}
  </OrderableList>
</div>
