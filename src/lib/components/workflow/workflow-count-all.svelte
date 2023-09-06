<script lang="ts">
  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { loading, updating } from '$lib/stores/workflows';
  import { isStatusFilter } from '$lib/utilities/query/filter-search';

  export let count = 0;
  export let active = false;
  export let onStatusClick: (status: 'all') => void = () => {};

  $: hasNonStatusQuery = $workflowFilters.some(
    (filter) => !isStatusFilter(filter.attribute),
  );
</script>

<button
  class="count-card w-32 min-w-fit flex flex-row lg:flex-col items-center lg:items-end gap-2 lg:gap-0 cursor-pointer py-1 px-2 lg:py-2 lg:px-4 border-2 border-gray-900 rounded-lg bg-white"
  class:active
  on:click={() => onStatusClick('all')}
  on:keypress={() => onStatusClick('all')}
>
  <div class="h-8 flex flex-col items-center">
    {#if $loading || $updating}
      <Spinner class="w-6 h-6 animate-spin" />
    {:else}
      <p class="font-mono text-sm lg:text-lg">{count.toLocaleString()}</p>
    {/if}
  </div>
  {#if hasNonStatusQuery}
    <div class="flex gap-1">Filtered</div>
  {:else}
    <p class="font-primary text-sm lg:text-lg">All</p>
  {/if}
</button>

<style lang="postcss">
  .active {
    @apply bg-indigo-100;
  }

  .count-card:hover {
    background: linear-gradient(157deg, #e6fffa 0%, #e0eaff 100%);
    box-shadow: 4px 4px 0 0 #000;
  }
</style>
