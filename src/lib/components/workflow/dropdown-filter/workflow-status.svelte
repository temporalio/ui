<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$holocene/icon/icon.svelte';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  const AllStatuses = {
    All: 'All',
    Running: 'Running',
    'Timed Out': 'TimedOut',
    Completed: 'Completed',
    Failed: 'Failed',
    'Continued as New': 'ContinuedAsNew',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
  };

  $: statusFilters = $workflowFilters.filter(
    (f) => f.attribute === 'ExecutionStatus',
  );
  $: statusSort = $workflowSorts.find((s) => s.attribute === 'ExecutionStatus');

  function mapStatusToFilter(value) {
    return {
      attribute: 'ExecutionStatus',
      value,
      conditional: '=',
      operator: '',
      parenthesis: '',
    };
  }

  function mapStatusesToFilters(filters) {
    if (filters.length === 1) {
      return [mapStatusToFilter(filters[0].value)];
    } else {
      return filters.map((filter, i) => {
        const parenthesis = i === 0 ? '(' : i === filters.length - 1 ? ')' : '';
        const operator = i === filters.length - 1 ? '' : 'OR';
        return {
          ...filter,
          operator,
          parenthesis,
        };
      });
    }
  }

  const onStatusClick = (_value: string) => {
    if (_value === 'All') {
      $workflowFilters = $workflowFilters.filter(
        (f) => f.attribute !== 'ExecutionStatus',
      );
    } else if (statusFilters.find((s) => s.value === _value)) {
      const nonStatusFilters = $workflowFilters.filter(
        (f) => f.attribute !== 'ExecutionStatus',
      );
      $workflowFilters = [
        ...nonStatusFilters,
        ...mapStatusesToFilters(
          statusFilters.filter((s) => s.value !== _value),
        ),
      ];
    } else {
      if (!statusFilters.length) {
        $workflowFilters = [...$workflowFilters, mapStatusToFilter(_value)];
      } else {
        const nonStatusFilters = $workflowFilters.filter(
          (f) => f.attribute !== 'ExecutionStatus',
        );
        $workflowFilters = [
          ...nonStatusFilters,
          ...mapStatusesToFilters([
            ...statusFilters,
            mapStatusToFilter(_value),
          ]),
        ];
      }
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };
</script>

<DropdownMenu
  value={statusFilters.length
    ? statusFilters.map((s) => s.value).join('')
    : statusSort?.value ?? ''}
  dataCy="execution-status-filter"
  keepOpen
  left
  icon="filter"
>
  <svelte:fragment slot="label">Status</svelte:fragment>
  <div class="flex w-56 flex-col gap-4 py-2">
    {#each Object.entries(AllStatuses) as [label, _value] (_value)}
      <button
        class="flex items-center transition-all hover:cursor-pointer"
        data-cy={label}
        on:click={() => onStatusClick(_value)}
      >
        <div
          class="ml-4 mr-2 h-4 w-4 rounded-sm ring-1 ring-gray-900"
          class:active={statusFilters.find((s) => s.value === _value) ||
            (!statusFilters.length && _value === 'All')}
        >
          {#if statusFilters.find((s) => s.value === _value) || (!statusFilters.length && _value === 'All')}
            <Icon
              class="pointer-events-none -mt-[1px] -ml-[2px] text-white"
              name="checkmark"
              width={20}
              height={20}
            />
          {/if}
        </div>
        <div class="flex h-6 items-center text-sm hover:scale-[103%]">
          {#if _value === 'All'}
            All Statuses
          {:else}
            <WorkflowStatus status={_value} />
          {/if}
        </div>
      </button>
    {/each}
  </div>
</DropdownMenu>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
