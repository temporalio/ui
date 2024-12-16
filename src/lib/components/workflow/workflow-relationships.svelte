<script lang="ts">
  import { page } from '$app/stores';

  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllRootWorkflows } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  import FirstPreviousNextWorkflowTable from './first-previous-next-workflow-table.svelte';
  // import LiveChildWorkflowsTable from './live-child-workflows-table.svelte';
  // import ParentWorkflowTable from './parent-workflow-table.svelte';
  import SchedulerTable from './scheduler-table.svelte';
  import WorkflowFamilyTree from './workflow-family-tree.svelte';

  $: ({ namespace, workflow: workflowId } = $page.params);
  $: ({ workflow } = $workflowRun);

  $: rootWorkflowId = workflow.rootExecution.workflowId;
  $: rootRunId = workflow.rootExecution.runId;

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );
  $: ({
    // hasChildren,
    hasRelationships,
    first,
    // parent,
    // parentNamespaceName,
    next,
    previous,
    scheduleId,
  } = workflowRelationships);
</script>

<div class="flex flex-col gap-4 pb-8">
  {#if hasRelationships}
    <div class="flex w-full flex-col justify-center gap-4">
      {#await fetchAllRootWorkflows(namespace, rootWorkflowId, rootRunId)}
        <Loading />
      {:then root}
        {#if root && !!root.children.length}
          <WorkflowFamilyTree {root} />
        {/if}
      {/await}
      {#if scheduleId}
        <SchedulerTable {scheduleId} {namespace} />
      {/if}
      <!-- {#if parent}
        <ParentWorkflowTable {parent} {parentNamespaceName} {namespace} />
      {/if}
      {#if hasChildren}
        {#await fetchAllChildWorkflows(namespace, workflowId, runId) then children}
          <LiveChildWorkflowsTable {children} />
        {/await}
      {/if} -->
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
