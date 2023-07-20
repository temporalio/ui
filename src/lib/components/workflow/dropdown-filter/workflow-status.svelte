<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { workflowStatusFilters } from '$lib/models/workflow-status';

  import type { WorkflowFilter } from '$lib/models/workflow-filters';
  import Translate from '$lib/i18n/translate.svelte';

  $: statusFilters = $workflowFilters.filter(
    (f) => f.attribute === 'ExecutionStatus',
  );

  function mapStatusToFilter(value: string) {
    return {
      attribute: 'ExecutionStatus',
      value,
      conditional: '=',
      operator: '',
      parenthesis: '',
    };
  }

  function mapStatusesToFilters(filters: WorkflowFilter[]) {
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

    updateQueryParamsFromFilter($page.url, $workflowFilters);
  };
</script>

<DropdownMenu
  value={statusFilters.length ? statusFilters.map((s) => s.value).join('') : ''}
  testId="execution-status-filter"
  keepOpen
  icon="filter"
>
  <svelte:fragment slot="label">Status</svelte:fragment>
  <div class="flex w-56 flex-col gap-4 py-2">
    {#each workflowStatusFilters as status (status)}
      <button
        class="flex items-center transition-all hover:cursor-pointer"
        data-testid={status}
        on:click={() => onStatusClick(status)}
      >
        <div
          class="ml-4 mr-2 h-4 w-4 rounded-sm ring-1 ring-gray-900"
          class:active={statusFilters.find((s) => s.value === status) ||
            (!statusFilters.length && status === 'All')}
        >
          {#if statusFilters.find((s) => s.value === status) || (!statusFilters.length && status === 'All')}
            <Icon
              class="pointer-events-none -mt-[1px] -ml-[2px] text-white"
              name="checkmark"
              width={20}
              height={20}
            />
          {/if}
        </div>
        <div class="flex h-6 items-center text-sm hover:scale-[103%]">
          {#if status === 'All'}
            <Translate namespace="workflows" key="all-statuses" />
          {:else}
            <WorkflowStatus {status} />
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
