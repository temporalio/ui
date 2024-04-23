<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import ChildWorkflowsTable from '$lib/components/workflow/child-workflows-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllChildWorkflows } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  import FirstPreviousNextWorkflowTable from './first-previous-next-workflow-table.svelte';
  import LiveChildWorkflowsTable from './live-child-workflows-table.svelte';
  import ParentWorkflowTable from './parent-workflow-table.svelte';
  import SchedulerTable from './scheduler-table.svelte';

  $: ({ workflow: workflowId, run: runId, namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  let liveChildren: WorkflowExecution[] = [];

  onMount(async () => {
    liveChildren = await fetchAllChildWorkflows(namespace, workflowId, runId);
  });

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );
  $: ({
    hasChildren,
    hasRelationships,
    first,
    parent,
    parentNamespaceName,
    children,
    next,
    previous,
    scheduleId,
  } = workflowRelationships);
</script>

<div class="flex flex-col gap-4">
  {#if hasRelationships}
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
    {#if liveChildren.length}
      <LiveChildWorkflowsTable children={liveChildren} />
    {:else if hasChildren}
      <ChildWorkflowsTable
        {children}
        pendingChildren={$workflowRun.workflow.pendingChildren}
        namespace={$page.params.namespace}
      />
    {/if}
  {:else}
    <p>{translate('workflows.no-relationships')}</p>
  {/if}
</div>
