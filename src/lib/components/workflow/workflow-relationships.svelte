<script lang="ts">
  import { page } from '$app/stores';

  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    fetchAllDirectWorkflows,
    fetchAllRootWorkflows,
    fetchAllRootWorkflowsCount,
  } from '$lib/services/workflow-service';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowFamilyTree from './relationships/workflow-family-tree.svelte';
  import WorkflowRelationshipsOld from './workflow-relationships-old.svelte';

  const MAX_UPPER_LIMIT = 5000;

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  let initialWorkflow: WorkflowExecution | undefined = undefined;

  $: rootWorkflowId = initialWorkflow?.rootExecution?.workflowId;
  $: rootRunId = initialWorkflow?.rootExecution?.runId;
  $: parentWorkflowId = initialWorkflow?.parent?.workflowId;
  $: parentRunId = initialWorkflow?.parent?.runId;

  $: {
    if (!initialWorkflow && workflow) initialWorkflow = workflow;
  }
</script>

<div class="pb-12">
  <div class="flex w-full flex-col justify-center gap-4">
    {#if initialWorkflow}
      {#await fetchAllRootWorkflowsCount(namespace, rootWorkflowId, rootRunId) then { count }}
        {@const intCount = parseInt(count)}
        {#if intCount > MAX_UPPER_LIMIT}
          {#await fetchAllDirectWorkflows( { namespace, parentWorkflowId, parentRunId, workflow: initialWorkflow }, )}
            <Loading />
          {:then root}
            <WorkflowFamilyTree {root} {namespace} />
          {:catch}
            <WorkflowRelationshipsOld />
          {/await}
        {:else}
          {#await fetchAllRootWorkflows(namespace, rootWorkflowId, rootRunId)}
            <Loading />
          {:then root}
            <WorkflowFamilyTree fullTree {root} {namespace} />
          {:catch}
            <WorkflowRelationshipsOld />
          {/await}
        {/if}
      {:catch}
        <WorkflowRelationshipsOld />
      {/await}
    {:else}
      <h4 class="px-8 py-4">{translate('workflows.no-relationships')}</h4>
    {/if}
  </div>
</div>
