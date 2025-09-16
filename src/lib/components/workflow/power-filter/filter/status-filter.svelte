<script lang="ts">
  import { writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuDivider,
    MenuItem,
  } from '$lib/holocene/menu';
  import Translate from '$lib/i18n/translate.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowStatusFilters } from '$lib/models/workflow-status';
  import { isStatusFilter } from '$lib/utilities/query/search-attribute-filter';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  export let filters: SearchAttributeFilter[];

  const { filter, resetFilter } = getContext<FilterContext>(FILTER_CONTEXT);
  const open = writable(true);
  $: _filters = [...filters];
  $: statusFilters = _filters.filter((filter) => isStatusFilter(filter));

  function apply() {
    filters = _filters;
    updateQueryParamsFromFilter($page.url, filters);
  }

  function mapStatusToFilter(value: string) {
    return {
      ...$filter,
      value,
    };
  }

  function mapStatusesToFilters(_filters: SearchAttributeFilter[]) {
    if (_filters.length === 1) {
      return [mapStatusToFilter(_filters[0].value)];
    } else {
      return _filters.map((filter, i) => {
        const operator = i === _filters.length - 1 ? '' : 'OR';
        return {
          ...filter,
          operator,
        };
      });
    }
  }

  const onStatusClick = (status: string) => {
    if (status === 'All') {
      _filters = filters.filter((f) => f.attribute !== 'ExecutionStatus');
    } else if (statusFilters.find((s) => s.value === status)) {
      const nonStatusFilters = filters.filter((f) => !isStatusFilter(f));
      _filters = [
        ...nonStatusFilters,
        ...mapStatusesToFilters(
          statusFilters.filter((s) => s.value !== status),
        ),
      ];
    } else {
      if (!statusFilters.length) {
        _filters = [..._filters, mapStatusToFilter(status)];
      } else {
        const nonStatusFilters = _filters.filter((f) => !isStatusFilter(f));
        _filters = [
          ...nonStatusFilters,
          ...mapStatusesToFilters([
            ...statusFilters,
            mapStatusToFilter(status),
          ]),
        ];
      }
    }
    apply();
  };
</script>

<MenuContainer {open} on:close={resetFilter}>
  <MenuButton
    controls="status-menu"
    on:click={() => {
      if ($open) resetFilter();
    }}
    size="xs"
  >
    {$filter.attribute}
  </MenuButton>
  <Menu id="status-menu" keepOpen>
    {#each workflowStatusFilters as status (status)}
      {@const checked =
        statusFilters.some((filter) => filter.value === status) ||
        (!statusFilters.length && status === 'All')}
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
        {#if status === 'All'}
          <Translate key="workflows.all-statuses" />
        {:else}
          <WorkflowStatus {status} />
        {/if}
      </MenuItem>
    {/each}
    <MenuDivider />
  </Menu>
</MenuContainer>
