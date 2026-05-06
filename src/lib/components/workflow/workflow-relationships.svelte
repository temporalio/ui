<script module lang="ts">
  import { writable } from 'svelte/store';

  export const showFullTree = writable(true);
</script>

<script lang="ts">
  import { page } from '$app/state';

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

  const namespace = $derived(page.params.namespace);
  const workflow = $derived($workflowRun.workflow);

  let initialWorkflow = $state<WorkflowExecution | undefined>(undefined);

  const rootWorkflowId = $derived(initialWorkflow?.rootExecution?.workflowId);
  const rootRunId = $derived(initialWorkflow?.rootExecution?.runId);
  const parentWorkflowId = $derived(initialWorkflow?.parent?.workflowId);
  const parentRunId = $derived(initialWorkflow?.parent?.runId);

  $effect(() => {
    if (!initialWorkflow && workflow) {
      initialWorkflow = workflow;
    }
  });

  const fetchWorkflowsForTree = async () => {
    if (!rootWorkflowId || !rootRunId) {
      return;
    }

    const result = await fetchAllRootWorkflowsCount(
      namespace,
      rootWorkflowId,
      rootRunId,
    );
    const count = parseInt(result.count ?? '0', 10);
    const overMaxLimit = count > MAX_UPPER_LIMIT;
    if (overMaxLimit) {
      $showFullTree = false;

      if (!parentWorkflowId || !parentRunId || !initialWorkflow) {
        return;
      }
      return fetchAllDirectWorkflows({
        namespace,
        parentWorkflowId,
        parentRunId,
        workflow: initialWorkflow,
      });
    }

    $showFullTree = true;
    return fetchAllRootWorkflows(namespace, rootWorkflowId, rootRunId);
  };
</script>

<div class="pb-12">
  <div class="flex w-full flex-col justify-center gap-4">
    {#if initialWorkflow}
      {#await fetchWorkflowsForTree()}
        <Loading />
      {:then root}
        {#if root}
          <WorkflowFamilyTree {root} {namespace} />
        {:else}
          <WorkflowRelationshipsOld />
        {/if}
      {:catch}
        <WorkflowRelationshipsOld />
      {/await}
    {:else}
      <h4 class="px-8 py-4">{translate('workflows.no-relationships')}</h4>
    {/if}
  </div>
</div>
