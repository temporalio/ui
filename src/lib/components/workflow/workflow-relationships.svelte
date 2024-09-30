<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllRootWorkflows } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  import FirstPreviousNextWorkflowTable from './first-previous-next-workflow-table.svelte';
  import SchedulerTable from './scheduler-table.svelte';
  import WorkflowAtom, { type RootNode } from './workflow-atom.svelte';

  $: ({ workflow: workflowId, namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  let root: RootNode = { children: [], workflow };
  let loading = false;

  onMount(async () => {
    try {
      loading = true;
      root = await fetchAllRootWorkflows(namespace, workflow);
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  });

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );
  $: ({ hasRelationships, first, next, previous, scheduleId } =
    workflowRelationships);
</script>

<h2>{translate('workflows.relationships')}</h2>
{#if loading}
  <Loading />
{:else if root?.children?.length}
  <WorkflowAtom {root} />
{/if}
<div class="flex flex-col gap-4">
  {#if hasRelationships}
    <div class="flex w-full flex-wrap gap-4">
      {#if scheduleId}
        <SchedulerTable {scheduleId} {namespace} />
      {/if}
      {#if first || previous || next}
        <FirstPreviousNextWorkflowTable
          {first}
          {previous}
          {next}
          workflow={workflowId}
          {namespace}
        />
      {/if}
    </div>
  {:else}
    <p>{translate('workflows.no-relationships')}</p>
  {/if}
</div>
