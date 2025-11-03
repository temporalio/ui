<script lang="ts">
  import { page } from '$app/state';

  import { fetchAllChildWorkflows } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  import ChildWorkflowsTable from './child-workflows-table.svelte';
  import FirstPreviousNextWorkflowTable from './first-previous-next-workflow-table.svelte';
  import LiveChildWorkflowsTable from './live-child-workflows-table.svelte';
  import ParentWorkflowTable from './parent-workflow-table.svelte';
  import SchedulerTable from './scheduler-table.svelte';

  $: ({ namespace, workflow: workflowId, run: runId } = page.params);
  $: ({ workflow } = $workflowRun);

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    page.data.namespace,
  );

  $: ({
    hasChildren,
    first,
    parent,
    parentNamespaceName,
    children,
    next,
    previous,
    scheduleId,
  } = workflowRelationships);
</script>

<div class="flex flex-col gap-4 px-4 py-4 xl:px-8">
  <div class="flex w-full flex-wrap gap-4">
    {#if scheduleId}
      <SchedulerTable {scheduleId} {namespace} />
    {/if}
    {#if parent}
      <ParentWorkflowTable {parent} {parentNamespaceName} {namespace} />
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
  {#await fetchAllChildWorkflows(namespace, workflowId, runId) then liveChildren}
    {#if liveChildren.length}
      <LiveChildWorkflowsTable children={liveChildren} />
    {:else if hasChildren}
      <ChildWorkflowsTable
        {children}
        pendingChildren={$workflowRun.workflow.pendingChildren}
        namespace={page.params.namespace}
      />
    {/if}
  {/await}
</div>
