<script lang="ts">
  import { namespace } from '$lib/stores/namespace';
  import { createWorkflowStore } from '$lib/stores/workflows';

  import Select from '$lib/components/filter-select.svelte';
  import Button from '$lib/components/main-button.svelte';

  export let currentPage: number;
  export let maximumPage: number;

  $: store = createWorkflowStore($namespace);
  $: sort = store.sort;
  $: sortBy = sort.property;
  $: sortOrder = sort.order;

  const increment = () => currentPage++;
  const decrement = () => currentPage--;

  $: isFirstPage = currentPage <= 0;
  $: isLastPage = currentPage >= maximumPage - 1;
</script>

<section class="bg-gray-100 p-4 flex gap-20 justify-between">
  {#if maximumPage > 0}
    <section class="flex gap-4 items-center">
      <Button
        variant="secondary"
        size="small"
        on:click={decrement}
        disabled={isFirstPage}>Previous</Button
      >
      <p>Page {currentPage + 1} of {maximumPage}</p>
      <Button
        variant="secondary"
        size="small"
        on:click={increment}
        disabled={isLastPage}>Next</Button
      >
    </section>
  {:else}
    <section class="flex gap-4 items-center">
      <p>No Workflow Executions</p>
    </section>
  {/if}
  <section class="flex gap-4">
    <Select id="sort-by" name="Sort By" bind:value={$sortBy} condensed>
      <option value={null}>Sort By…</option>
      <option value={'name'}>Sort By Name</option>
      <option value={'startTime'}>Sort By Start Time</option>
      <option value={'endTime'}>Sort By End Time</option>
      <option value={'status'}>Sort By Status</option>
    </Select>
    <Select id="sort-order" name="Sort Order" bind:value={$sortOrder} condensed>
      <option value={'ascending'}>Ascending</option>
      <option value={'descending'}>Descending</option>
    </Select>
  </section>
</section>
