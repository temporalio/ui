<script lang="ts">
  import { page } from '$app/stores';

  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    fetchAllRootWorkflows,
    fetchAllRootWorkflowsCount,
  } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getStatusAndCountOfGroup } from '$lib/utilities/get-group-status-and-count';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  import WorkflowCountStatus from '../workflow-status.svelte';

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

  const MAX_UPPER_LIMIT = 3000;
</script>

<div class="flex flex-col gap-4 pb-12">
  {#if hasRelationships}
    <div class="flex w-full flex-col justify-center gap-4">
      {#await fetchAllRootWorkflowsCount(namespace, rootWorkflowId, rootRunId)}
        <Loading />
      {:then { count, groups }}
        {#if parseInt(count) > MAX_UPPER_LIMIT}
          {@const statusGroups = getStatusAndCountOfGroup(groups)}
          <div class="flex flex-col gap-2 px-8 py-4">
            <h4 class="text-xl font-medium">
              {count} Workflows associated to Root Workflow
            </h4>
            <div class="flex flex-wrap items-center gap-1">
              {#each statusGroups as { count, status } (status)}
                <WorkflowCountStatus
                  {status}
                  {count}
                  big
                  test-id="workflow-status-{status}"
                />
              {/each}
            </div>
            {#if scheduleId}
              <ScheduleTree
                {scheduleId}
                current={runId}
                {workflowId}
                {namespace}
              />
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
          </div>
        {:else}
          {#await fetchAllRootWorkflows(namespace, rootWorkflowId, rootRunId)}
            <Loading />
          {:then root}
            {#if root && !!root.children.length}
              <WorkflowFamilyTree {root} />
            {/if}
            {#if scheduleId}
              <ScheduleTree
                {scheduleId}
                current={runId}
                {workflowId}
                {namespace}
              />
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
        {/if}
      {:catch}
        <WorkflowRelationshipsOld />
      {/await}
    </div>
  {:else}
    <h4 class="px-8 py-4">{translate('workflows.no-relationships')}</h4>
  {/if}
</div>
