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

<div class="flex h-6 text-center text-sm font-medium leading-4">
  <span
    class="flex items-center whitespace-nowrap rounded-sm px-1 py-0.5 font-secondary"
  >
    {#if $loading || $updating}
      <Spinner class="h-6 w-6 animate-spin" />
    {:else}
      {count.toLocaleString()} Total
    {/if}
  </span>
</div>

<style lang="postcss">
  .active {
    @apply bg-indigo-100;
  }

  .count-card:hover {
    background: linear-gradient(157deg, #e6fffa 0%, #e0eaff 100%);
    box-shadow: 4px 4px 0 0 #000;
  }
</style>
