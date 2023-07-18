<script lang="ts">
  import { page } from '$app/stores';

  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';

  import { translate } from '$lib/i18n/translate';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { isStatusFilter } from '$lib/utilities/query/filter-search';
  import { labsMode } from '$lib/stores/labs-mode';
  import { workflowFilters } from '$lib/stores/filters';
  import { workflowStatuses } from '$lib/models/workflow-status';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  import type { WorkflowFilter } from '$lib/models/workflow-filters';

  type T = $$Generic;

  const { filter, resetFilter } = getContext<FilterContext<T>>(FILTER_CONTEXT);

  $: filters = [...$workflowFilters];
  $: statusFilters = filters.filter((filter) =>
    isStatusFilter(filter.attribute),
  );

  function onApply() {
    $workflowFilters = filters;
    updateQueryParamsFromFilter($page.url, $workflowFilters, $labsMode);
    resetFilter();
  }

  function mapStatusToFilter(value: string) {
    return {
      ...$filter,
      value,
    };
  }

  function mapStatusesToFilters(filters: WorkflowFilter[]) {
    if (filters.length === 1) {
      return [mapStatusToFilter(filters[0].value)];
    } else {
      return filters.map((filter, i) => {
        const operator = i === filters.length - 1 ? '' : 'OR';
        return {
          ...filter,
          operator,
        };
      });
    }
  }

  const onStatusClick = (status: string) => {
    if (statusFilters.find((s) => s.value === status)) {
      const nonStatusFilters = $workflowFilters.filter(
        (f) => !isStatusFilter(f.attribute),
      );
      filters = [
        ...nonStatusFilters,
        ...mapStatusesToFilters(
          statusFilters.filter((s) => s.value !== status),
        ),
      ];
    } else {
      if (!statusFilters.length) {
        filters = [...filters, mapStatusToFilter(status)];
      } else {
        const nonStatusFilters = filters.filter(
          (f) => !isStatusFilter(f.attribute),
        );
        filters = [
          ...nonStatusFilters,
          ...mapStatusesToFilters([
            ...statusFilters,
            mapStatusToFilter(status),
          ]),
        ];
      }
    }
  };
</script>

<MenuContainer let:open>
  <Button
    id="status-filter"
    variant="search"
    on:click={() => open.update((previous) => !previous)}
  >
    {$filter.attribute}
  </Button>
  <Menu class="max-h-80 overflow-y-scroll w-fit" id="status-menu" keepOpen>
    {#each workflowStatuses as status (status)}
      {@const isActive = statusFilters.find(
        (filter) => filter.value === status,
      )}
      <MenuItem
        class="transition-all hover:cursor-pointer !p-2"
        data-testid={status}
        on:click={() => {
          onStatusClick(status);
        }}
      >
        <span class="flex items-center">
          <div
            class="mr-2 h-4 w-4 rounded-sm ring-1 ring-gray-900"
            class:active={isActive}
          >
            {#if isActive}
              <Icon
                class="pointer-events-none -mt-[1px] -ml-[2px] "
                name="checkmark"
                width={20}
                height={20}
              />
            {/if}
          </div>
          <WorkflowStatus {status} />
        </span>
      </MenuItem>
    {/each}
    <div class="pt-2 border-t border-gray-300">
      <Button thin class="!w-full " on:click={onApply}
        >{translate('apply')}</Button
      >
    </div>
  </Menu>
</MenuContainer>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
