<script lang="ts">
  import { page } from '$app/stores';
  import {
    loading,
    updating,
    refresh,
    workflowCount,
  } from '$lib/stores/workflows';

  import PageTitle from '$lib/components/page-title.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { onMount } from 'svelte';

  export let onClick: () => void;

  $: namespace = $page.params.namespace;
  $: query = $page.url.searchParams.get('query');
  $: totalWorkflowCount = new Intl.NumberFormat('en-US').format(
    $workflowCount?.totalCount ?? 0,
  );
  $: filteredWorkflowCount = new Intl.NumberFormat('en-US').format(
    $workflowCount?.count ?? 0,
  );

  let refreshInterval;
  let autoRefresh = false;

  onMount(() => {
    refreshInterval = setInterval(() => {
      $refresh = Date.now();
    }, 5000);
    return () => clearInterval(refreshInterval);
  });

  const onRefreshChange = () => {
    if (autoRefresh) {
      autoRefresh = false;
      clearInterval(refreshInterval);
    } else {
      autoRefresh = true;
      $refresh = Date.now();
      clearInterval(refreshInterval);
      refreshInterval = setInterval(() => ($refresh = Date.now()), 5000);
    }
  };
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>
<div class="mb-2 flex justify-between">
  <div class="justify-between">
    <h1 class="text-2xl" data-cy="namespace-title">
      Recent Workflows
      <NamespaceSelector />
    </h1>
    <div class="flex items-center gap-2 text-sm">
      <p data-cy="namespace-name">
        {namespace}
      </p>
      {#if $workflowCount?.totalCount >= 0}
        <div class="h-1 w-1 rounded-full bg-gray-400" />
        <p data-cy="workflow-count">
          {#if $loading}
            <span class="text-gray-400">loading</span>
          {:else if $updating}
            <span class="text-gray-400">filtering</span>
          {:else if query}
            Results {filteredWorkflowCount} of {totalWorkflowCount} workflows
          {:else}
            {totalWorkflowCount} workflows
          {/if}
        </p>
      {/if}
    </div>
  </div>
  <div class="flex items-center gap-4">
    <label
      for="autorefresh"
      class="flex items-center gap-4 font-secondary text-sm"
      >Auto refresh
      <Tooltip bottomLeft text="5 second search refresh">
        <ToggleSwitch
          id="autorefresh"
          checked={autoRefresh}
          on:change={onRefreshChange}
        />
      </Tooltip>
    </label>
    <Button variant="secondary" class="h-10 w-10" on:click={onClick}
      ><Icon name="arrow-right" />Dashboard View</Button
    >
    <!-- <WorkflowDateTimeFilter /> -->
  </div>
</div>
