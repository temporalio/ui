<script lang="ts">
  import { page } from '$app/stores';

  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    fetchAllDirectWorkflows,
    fetchAllRootWorkflows,
    fetchAllRootWorkflowsCount,
  } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  import WorkflowFamilyTree from './relationships/workflow-family-tree.svelte';
  import WorkflowRelationshipsOld from './workflow-relationships-old.svelte';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  $: rootWorkflowId = workflow.rootExecution.workflowId;
  $: rootRunId = workflow.rootExecution.runId;
  $: parentWorkflowId = workflow?.parent?.workflowId;
  $: parentRunId = workflow?.parent?.runId;

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );
  $: ({ hasRelationships, first, next, previous } = workflowRelationships);

  const MAX_UPPER_LIMIT = 5000;
</script>

<div class="flex flex-col gap-4 pb-12">
  {#if hasRelationships}
    <div class="flex w-full flex-col justify-center gap-4">
      {#await fetchAllRootWorkflowsCount(namespace, rootWorkflowId, rootRunId) then { count }}
        {@const intCount = parseInt(count)}
        {#if intCount > MAX_UPPER_LIMIT}
          {#await fetchAllDirectWorkflows( { namespace, parentWorkflowId, parentRunId, workflow }, )}
            <Loading />
          {:then root}
            <WorkflowFamilyTree {root} {namespace} {first} {previous} {next} />
          {:catch}
            <WorkflowRelationshipsOld />
          {/await}
        {:else}
          {#await fetchAllRootWorkflows(namespace, rootWorkflowId, rootRunId)}
            <Loading />
          {:then root}
            <WorkflowFamilyTree
              fullTree
              {root}
              {namespace}
              {first}
              {previous}
              {next}
            />
          {:catch}
            <WorkflowRelationshipsOld />
          {/await}
        {/if}
      {:catch}
        <WorkflowRelationshipsOld />
      {/await}
    </div>
  {:else}
    <h4 class="px-8 py-4">{translate('workflows.no-relationships')}</h4>
  {/if}
</div>
