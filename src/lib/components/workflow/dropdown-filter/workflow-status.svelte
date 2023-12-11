<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import type { WorkflowFilter } from '$lib/models/workflow-filters';
  import { workflowStatusFilters } from '$lib/models/workflow-status';
  import { workflowFilters } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  $: statusFilters = $workflowFilters.filter(
    (f) => f.attribute === 'ExecutionStatus',
  );

  function mapStatusToFilter(value: string): WorkflowFilter {
    return {
      attribute: 'ExecutionStatus',
      type: 'Keyword',
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

    updateQueryParamsFromFilter($page.url, $workflowFilters, true);
  };
</script>

<MenuContainer>
  <MenuButton
    data-testid="execution-status-filter-button"
    variant="table-header"
    controls="execution-status-filter"
  >
    {translate('common.status')}
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
          <Translate key="workflows.all-statuses" />
        {:else}
          <WorkflowStatus {status} />
        {/if}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
