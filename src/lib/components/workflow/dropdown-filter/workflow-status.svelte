<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Sort from './sort.svelte';

  export let statusFilters = [];
  export let sorts = [];
  export let onChange: () => void;

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

  function mapStatusToFilter(value) {
    return {
      filterType: 'executionStatus',
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
      statusFilters = [];
    } else if (statusFilters.find((s) => s.value === _value)) {
      statusFilters = mapStatusesToFilters(
        statusFilters.filter((s) => s.value !== _value),
      );
    } else {
      if (!statusFilters.length) {
        statusFilters = [mapStatusToFilter(_value)];
      } else {
        const _filters = [...statusFilters, mapStatusToFilter(_value)];
        statusFilters = mapStatusesToFilters(_filters);
      }
    }
    onChange();
  };
</script>

<DropdownMenu value={statusFilters.map((s) => s.value).join('')} keepOpen left>
  <svelte:fragment slot="label">Status</svelte:fragment>
  <div class="flex w-56 flex-col gap-4">
    {#each Object.entries(AllStatuses) as [label, _value] (_value)}
      <div
        class="flex items-center transition-all hover:cursor-pointer"
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
        <div class="flex h-6 items-center text-base hover:scale-[103%]">
          {#if _value === 'All'}
            All Statuses
          {:else}
            <WorkflowStatus status={_value} />
          {/if}
        </div>
      </div>
    {/each}
    <Sort type="ExecutionStatus" bind:sorts {onChange} />
  </div></DropdownMenu
>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
