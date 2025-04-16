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

  import WorkflowFamilyTree from './relationships/workflow-family-tree.svelte';
  import WorkflowRelationshipsOld from './workflow-relationships-old.svelte';

  const MAX_UPPER_LIMIT = 5000;

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  $: rootWorkflowId = workflow.rootExecution.workflowId;
  $: rootRunId = workflow.rootExecution.runId;
  $: parentWorkflowId = workflow?.parent?.workflowId;
  $: parentRunId = workflow?.parent?.runId;
</script>

<div class="pb-12">
  <div class="flex w-full flex-col justify-center gap-4">
    {#await fetchAllRootWorkflowsCount(namespace, rootWorkflowId, rootRunId) then { count }}
      {@const intCount = parseInt(count)}
      {#if intCount > MAX_UPPER_LIMIT}
        {#await fetchAllDirectWorkflows( { namespace, parentWorkflowId, parentRunId, workflow }, )}
          <Loading />
        {:then root}
          <WorkflowFamilyTree {root} {namespace} />
        {:catch}
          <WorkflowRelationshipsOld />
        {/await}
      {:else if intCount > 0}
        {#await fetchAllRootWorkflows(namespace, rootWorkflowId, rootRunId)}
          <Loading />
        {:then root}
          <WorkflowFamilyTree fullTree {root} {namespace} />
        {:catch}
          <WorkflowRelationshipsOld />
        {/await}
      {:else}
        <h4 class="px-8 py-4">{translate('workflows.no-relationships')}</h4>
      {/if}
    {:catch}
      <WorkflowRelationshipsOld />
    {/await}
  </div>
</div>
