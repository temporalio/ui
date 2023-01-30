<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { SortOrder } from '$lib/models/workflow-filters';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  export let type: string;

  const onSortClick = (value: SortOrder) => {
    if ($workflowSorts.find((s) => s.value === value && s.attribute === type)) {
      $workflowSorts = [];
    } else {
      $workflowSorts = [
        {
          attribute: type,
          value,
        },
      ];
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };
</script>

<div class="mt-2 transition-all hover:cursor-pointer">
  <button class="flex items-center" on:click={() => onSortClick('asc')}>
    <div
      class="ml-4 mr-2 h-6 w-6 rounded-sm text-gray-900"
      class:active={$workflowSorts.find(
        (s) => s.value === 'asc' && s.attribute === type,
      )}
    >
      <Icon
        class="pointer-events-none -mt-[1px]"
        name="ascending"
        width={24}
        height={24}
      />
    </div>
    <div class="p-1 hover:scale-[103%]">Ascending</div>
  </button>
  <button class="flex items-center" on:click={() => onSortClick('desc')}>
    <div
      class="ml-4 mr-2 h-6 w-6 rounded-sm text-gray-900"
      class:active={$workflowSorts.find(
        (s) => s.value === 'desc' && s.attribute === type,
      )}
    >
      <Icon
        class="pointer-events-none -mt-[1px]"
        name="descending"
        width={24}
        height={24}
      />
    </div>
    <div class="p-1 hover:scale-[103%]">Descending</div>
  </button>
</div>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
