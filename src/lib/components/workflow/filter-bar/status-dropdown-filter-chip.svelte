<script lang="ts">
  import { writable } from 'svelte/store';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Translate from '$lib/i18n/translate.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowStatusFilters } from '$lib/models/workflow-status';

  type Props = {
    filters: SearchAttributeFilter[];
    onUpdate: (updatedFilter: SearchAttributeFilter[]) => void;
    index?: number;
    openIndex?: number;
  };

  let { filters, onUpdate, index = 0, openIndex = null }: Props = $props();

  const open = writable(false);
  let localFilters = $state([...filters]);

  const controlsId = $derived('dropdown-filter-chip-execution-status');

  function handleStatusSelect(status: string) {
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
        {
          attribute: 'ExecutionStatus',
          operator: '',
          parenthesis: '',
          type: 'Keyword',
          value: status,
          conditional: '=',
        },
      ];
    } else {
      localFilters = [
        ...localFilters,
        {
          attribute: 'ExecutionStatus',
          operator: '',
          parenthesis: localFilters.length ? ')' : '',
          type: 'Keyword',
          value: status,
          conditional: '=',
        },
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
    ExecutionStatus =<span class="pl-1 text-brand"
      >{filters.map((f) => f.value).join(', ')}</span
    >
  </MenuButton>

  <Menu id={controlsId} class="max-h-fit w-80 max-w-fit p-4" keepOpen>
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium">Filter by Execution Status</h3>
      </div>

      {#each workflowStatusFilters as status (status)}
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
              label={status}
              labelHidden
            />
          {/snippet}
          {#if status === 'All'}
            <Translate key="workflows.all-statuses" />
          {:else}
            <WorkflowStatus {status} />
          {/if}
        </MenuItem>
      {/each}
    </div>
  </Menu>
</MenuContainer>
