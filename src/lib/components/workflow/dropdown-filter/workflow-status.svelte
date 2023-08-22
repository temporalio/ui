<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { workflowStatusFilters } from '$lib/models/workflow-status';
  import type { WorkflowStatus as TWorkflowStatus } from '$lib/types/workflows';

  import type { WorkflowFilter } from '$lib/models/workflow-filters';
  import Translate from '$lib/i18n/translate.svelte';
  import { translate } from '$lib/i18n/translate';
  import Checkbox from '$lib/holocene/checkbox.svelte';

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

  const isActive = (status: 'All' | TWorkflowStatus) => {
    if (status === 'All') return statusFilters.length === 0;
    return statusFilters.some((filter) => filter.value === status);
  };
</script>

<MenuContainer>
  <MenuButton
    data-testid="execution-status-filter-button"
    variant="table-header"
    controls="execution-status-filter"
  >
    {translate('status')}
    <Icon name="filter" slot="trailing" />
  </MenuButton>
  <Menu keepOpen id="execution-status-filter">
    {#each workflowStatusFilters as status}
      <MenuItem on:click={() => onStatusClick(status)}>
        <Checkbox
          slot="leading"
          label={status}
          labelHidden
          tabindex={-1}
          on:click={() => onStatusClick(status)}
          checked={statusFilters.some((filter) => filter.value === status) ||
            (!statusFilters.length && status === 'All')}
        />
        {#if status === 'All'}
          <Translate namespace="workflows" key="all-statuses" />
        {:else}
          <WorkflowStatus {status} />
        {/if}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
