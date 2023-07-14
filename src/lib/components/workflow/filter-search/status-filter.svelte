<script lang="ts">
  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';
  import {
    workflowStatuses,
    isWorkflowStatusType,
  } from '$lib/models/workflow-status';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  type T = $$Generic;

  const { filter, handleSubmit } = getContext<FilterContext<T>>(FILTER_CONTEXT);
</script>

<MenuContainer let:open>
  <Button
    id="status-filter"
    variant="search"
    unroundLeft
    on:click={() => open.update((previous) => !previous)}
  >
    {#if $filter.value && isWorkflowStatusType($filter.value)}
      <WorkflowStatus status={$filter.value} />
    {:else}
      Select a status
    {/if}
  </Button>
  <Menu class="max-h-80 overflow-y-scroll w-fit" id="status-menu">
    {#each workflowStatuses as status (status)}
      <MenuItem
        class="transition-all hover:cursor-pointer !p-2"
        data-testid={status}
        on:click={() => {
          $filter.value = status;
          handleSubmit();
        }}
      >
        <span class="flex">
          {#if status === $filter.value}
            <Icon
              class="mr-1 text-blue-700"
              name="checkmark"
              width={20}
              height={20}
            />
          {/if}
          <WorkflowStatus {status} />
        </span>
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
