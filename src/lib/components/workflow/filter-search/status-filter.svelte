<script lang="ts">
  import { writable } from 'svelte/store';

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
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import {
    MenuContainer,
    Menu,
    MenuItem,
    MenuButton,
    MenuDivider,
  } from '$lib/holocene/menu';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import type { WorkflowFilter } from '$lib/models/workflow-filters';

  type T = $$Generic;

  const { filter, resetFilter } = getContext<FilterContext<T>>(FILTER_CONTEXT);
  const open = writable(true);
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

<MenuContainer {open}>
  <MenuButton controls="status-menu">
    {$filter.attribute}
  </MenuButton>
  <Menu id="status-menu" keepOpen>
    {#each workflowStatuses as status (status)}
      {@const checked = statusFilters.some((filter) => filter.value === status)}
      <MenuItem
        data-testid={status}
        on:click={() => {
          onStatusClick(status);
        }}
      >
        <Checkbox
          on:click={() => onStatusClick(status)}
          slot="leading"
          {checked}
          label={status}
          labelHidden
        />
        <WorkflowStatus {status} />
      </MenuItem>
    {/each}
    <MenuDivider />
    <Button variant="ghost" class="!w-full " on:click={onApply}
      >{translate('apply')}</Button
    >
  </Menu>
</MenuContainer>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
