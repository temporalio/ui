<script lang="ts">
  import { writable } from 'svelte/store';

  import WorkerStatus from '$lib/components/workers/worker-status.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Translate from '$lib/i18n/translate.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type {
    WorkerFilters,
    WorkerStatus as WorkerStatusType,
  } from '$lib/models/worker-status';
  import { workerStatusFilters } from '$lib/models/worker-status';
  import {
    type WorkflowFilters,
    workflowStatusFilters,
  } from '$lib/models/workflow-status';
  import type { WorkflowStatus as WorkflowStatusType } from '$lib/types/workflows';
  import { createFilter } from '$lib/utilities/query/to-list-workflow-filters.js';

  import type { StatusAttribute } from './types.ts';

  interface Props {
    attribute: StatusAttribute;
    filters: SearchAttributeFilter[];
    onUpdate: (updatedFilter: SearchAttributeFilter[]) => void;
    index?: number;
    openIndex?: number | null;
  }

  let {
    attribute,
    filters,
    onUpdate,
    index = 0,
    openIndex = null,
  }: Props = $props();

  const statuses: Record<
    StatusAttribute,
    { label: string; filters: WorkflowFilters | WorkerFilters }
  > = {
    ExecutionStatus: {
      label: 'Execution Status',
      filters: workflowStatusFilters,
    },
    WorkerStatus: {
      label: 'Worker Status',
      filters: workerStatusFilters,
    },
  };

  const open = writable(false);
  let localFilters = $state([...filters]);

  const controlsId = $derived(
    `dropdown-filter-chip-${attribute.toLowerCase()}`,
  );

  function handleStatusSelect(status: string | null) {
    if (localFilters.find((f) => f.value === status)) {
      localFilters = localFilters.filter((f) => f.value !== status);
      onUpdate(localFilters);
      return;
    }

    if (status === 'All') {
      localFilters = [];
      onUpdate(localFilters);
      return;
    }

    if (localFilters.length === 1 && localFilters[0].value === '') {
      localFilters = [
        createFilter({
          attribute,
          type: 'Keyword',
          value: status ?? undefined,
          conditional: '=',
        }),
      ];
    } else {
      localFilters = [
        ...localFilters,
        createFilter({
          attribute,
          parenthesis: localFilters.length ? ')' : '',
          type: 'Keyword',
          value: status ?? undefined,
          conditional: '=',
        }),
      ];
    }

    if (localFilters.length > 1) {
      localFilters[0].parenthesis = '(';
      localFilters[localFilters.length - 2].operator = 'OR';
    }

    onUpdate(localFilters);
  }

  $effect(() => {
    if (openIndex === index) {
      $open = true;
    }
  });

  $effect(() => {
    if (!$open) {
      localFilters = [...filters];
    }
  });
</script>

<MenuContainer {open}>
  <MenuButton size="xs" controls={controlsId} hasIndicator class="bg-secondary">
    {attribute} =<span class="pl-1 text-brand"
      >{filters.map((f) => f.value).join(', ')}</span
    >
  </MenuButton>

  <Menu id={controlsId} class="max-h-fit w-80 max-w-fit p-4" keepOpen>
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium">
          Filter by {statuses[attribute].label}
        </h3>
      </div>

      {#each statuses[attribute].filters as status (status)}
        {@const checked =
          localFilters.some((filter) => filter.value === status) ||
          (localFilters.length === 1 &&
            !localFilters[0].value &&
            status === 'All')}
        <MenuItem
          data-testid={`status-dropdown-filter-chip-${status}`}
          onclick={() => handleStatusSelect(status)}
        >
          {#snippet leading()}
            <Checkbox
              on:change={() => handleStatusSelect(status)}
              {checked}
              label={status ?? undefined}
              labelHidden
            />
          {/snippet}
          {#if status === 'All'}
            <Translate key="workflows.all-statuses" />
          {:else if attribute === 'ExecutionStatus'}
            <WorkflowStatus status={status as WorkflowStatusType} />
          {:else if attribute === 'WorkerStatus'}
            <WorkerStatus status={status as WorkerStatusType} />
          {/if}
        </MenuItem>
      {/each}
    </div>
  </Menu>
</MenuContainer>
