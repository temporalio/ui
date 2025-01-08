<script lang="ts">
  import { page } from '$app/stores';

  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllRootWorkflows } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  import ContinueAsNewTree from './relationships/continue-as-new-tree.svelte';
  import ScheduleTree from './relationships/schedule-tree.svelte';
  import WorkflowFamilyTree from './relationships/workflow-family-tree.svelte';
  import WorkflowRelationshipsOld from './workflow-relationships-old.svelte';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: ({ workflow } = $workflowRun);

  $: rootWorkflowId = workflow.rootExecution.workflowId;
  $: rootRunId = workflow.rootExecution.runId;

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );
  $: ({ hasRelationships, first, next, previous, scheduleId } =
    workflowRelationships);
</script>

<div class="flex flex-col gap-4 pb-16">
  {#if hasRelationships}
    <div class="flex w-full flex-col justify-center gap-4">
      {#await fetchAllRootWorkflows(namespace, rootWorkflowId, rootRunId)}
        <Loading />
      {:then root}
        {#if root && !!root.children.length}
          <WorkflowFamilyTree {root} />
        {/if}
        {#if scheduleId}
          <ScheduleTree {scheduleId} current={runId} {workflowId} {namespace} />
        {/if}
        {#if first || previous || next}
          <ContinueAsNewTree
            {first}
            {previous}
            {next}
            current={runId}
            {workflowId}
            {namespace}
          />
        {/if}
      {:catch}
        <WorkflowRelationshipsOld />
      {/await}
    </div>
  {:else}
    <h4 class="px-8">{translate('workflows.no-relationships')}</h4>
  {/if}
</div>
