<script lang="ts">
  import WorkerStatus from '$lib/components/workers/worker-status.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type {
    WorkerFilters,
    WorkerStatus as WorkerStatusType,
  } from '$lib/models/worker-status';
  import { workerStatusFilters } from '$lib/models/worker-status';
  import {
    isWorkflowStatusType,
    type WorkflowFilters,
    workflowStatusFilters,
  } from '$lib/models/workflow-status';
  import type { StatusAttribute } from '$lib/utilities/query/quick-filter';
  import { createFilter } from '$lib/utilities/query/to-list-workflow-filters.js';

  interface Props {
    attribute: StatusAttribute;
    filters: SearchAttributeFilter[];
    onUpdate: (updatedFilter: SearchAttributeFilter[]) => void;
  }

  let { attribute, filters, onUpdate }: Props = $props();

  const statuses: Record<
    StatusAttribute,
    { label: string; filters: WorkflowFilters | WorkerFilters }
  > = {
    ExecutionStatus: {
      label: translate('common.execution-status'),
      filters: workflowStatusFilters,
    },
    WorkerStatus: {
      label: translate('common.worker-status'),
      filters: workerStatusFilters,
    },
  };

  const isWorkerStatusType = (
    status: string | null,
  ): status is WorkerStatusType =>
    status === 'Unspecified' ||
    status === 'Running' ||
    status === 'ShuttingDown';

  function handleStatusSelect(status: string | null) {
    if (filters.some((f) => f.value === status)) {
      onUpdate(filters.filter((f) => f.value !== status));
      return;
    }

    if (status === 'All') {
      onUpdate([]);
      return;
    }

    let next: SearchAttributeFilter[];

    if (filters.length === 1 && filters[0].value === '') {
      next = [
        createFilter({
          attribute,
          type: 'Keyword',
          value: status ?? undefined,
          conditional: '=',
        }),
      ];
    } else {
      next = [
        ...filters.map((filter) => ({ ...filter })),
        createFilter({
          attribute,
          parenthesis: filters.length ? ')' : '',
          type: 'Keyword',
          value: status ?? undefined,
          conditional: '=',
        }),
      ];
    }

    if (next.length > 1) {
      next[0].parenthesis = '(';
      next[next.length - 2].operator = 'OR';
    }

    onUpdate(next);
  }
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-medium">
      {translate('common.filter-by-column', {
        column: statuses[attribute].label,
      })}
    </h3>
  </div>

  {#each statuses[attribute].filters as status (status)}
    {@const checked =
      filters.some((filter) => filter.value === status) ||
      (status === 'All' &&
        (filters.length === 0 || (filters.length === 1 && !filters[0].value)))}
    <MenuItem
      data-testid={`status-dropdown-filter-chip-${status}`}
      onclick={() => handleStatusSelect(status)}
    >
      {#snippet leading()}
        <Checkbox
          onChange={() => handleStatusSelect(status)}
          {checked}
          label={status ?? undefined}
          labelHidden
        />
      {/snippet}
      {#if status === 'All'}
        <Translate key="workflows.all-statuses" />
      {:else if attribute === 'ExecutionStatus' && status && isWorkflowStatusType(status)}
        <WorkflowStatusBadge {status} />
      {:else if attribute === 'WorkerStatus' && isWorkerStatusType(status)}
        <WorkerStatus {status} />
      {/if}
    </MenuItem>
  {/each}
</div>
