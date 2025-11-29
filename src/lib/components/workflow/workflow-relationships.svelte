<script context="module" lang="ts">
  export const showFullTree = writable(true);
</script>

<script lang="ts">
  import { writable } from 'svelte/store';

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

  export let namespace: string;

  $: ({ workflow } = $workflowRun);

  let initialWorkflow: WorkflowExecution | undefined = undefined;

  $: rootWorkflowId = initialWorkflow?.rootExecution?.workflowId;
  $: rootRunId = initialWorkflow?.rootExecution?.runId;
  $: parentWorkflowId = initialWorkflow?.parent?.workflowId;
  $: parentRunId = initialWorkflow?.parent?.runId;

  $: {
    if (!initialWorkflow && workflow) {
      initialWorkflow = workflow;
    }
  }

  const fetchWorkflowsForTree = async () => {
    const result = await fetchAllRootWorkflowsCount(
      namespace,
      rootWorkflowId,
      rootRunId,
    );
    const count = parseInt(result.count);
    const overMaxLimit = count > MAX_UPPER_LIMIT;
    if (overMaxLimit) {
      $showFullTree = false;
    } else {
      $showFullTree = true;
    }

    return overMaxLimit
      ? fetchAllDirectWorkflows({
          namespace,
          parentWorkflowId,
          parentRunId,
          workflow: initialWorkflow,
        })
      : fetchAllRootWorkflows(namespace, rootWorkflowId, rootRunId);
  };
</script>

<div class="pb-12">
  <div class="flex w-full flex-col justify-center gap-4">
    {#if initialWorkflow}
      {#await fetchWorkflowsForTree()}
        <Loading />
      {:then root}
        <WorkflowFamilyTree {root} {namespace} />
      {:catch}
        <WorkflowRelationshipsOld />
      {/await}
    {:else}
      <h4 class="px-8 py-4">{translate('workflows.no-relationships')}</h4>
    {/if}
  </div>
</div>
