<script lang="ts">
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { eventFilterSort } from '$lib/stores/event-view';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import GroupCard from './group-card.svelte';

  let { namespace, workflowId, runId } = $props();

  let workflowRunController: AbortController;

  // $: pendingActivities = workflow?.pendingActivities;
  // $: pendingNexusOperations = workflow?.pendingNexusOperations;
  const reverseSort = $derived($eventFilterSort === 'descending');

  const getWorkflowAndEventHistory = async (): Promise<
    [WorkflowExecution, WorkflowEvents, EventGroups]
  > => {
    const result = await fetchWorkflow({
      namespace,
      workflowId,
      runId,
    });
    const workflow = result.workflow;

    workflowRunController = new AbortController();

    const history = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      sort: 'ascending',
      signal: workflowRunController.signal,
      setHistory: false,
      historySize: workflow.historyEvents,
    });
    const ascendingGroups = groupEvents(history, 'ascending', [], []);
    const groups = reverseSort
      ? [...ascendingGroups].reverse()
      : ascendingGroups;

    return [workflow, history, groups];
  };

  const _abortPolling = () => {
    if (workflowRunController) {
      workflowRunController.abort();
    }
  };
</script>

{#await getWorkflowAndEventHistory() then [workflow, history, groups]}
  <div class="flex flex-col">
    <Card class="surface-primary">
      <div class="flex flex-col gap-2">
        <InputAndResults
          showTitle={false}
          {workflow}
          {history}
          maxHeight={20000}
        />
      </div>
    </Card>
  </div>
  <div class="relative">
    <div class="flex w-full flex-col gap-2">
      {#each groups as group}
        <GroupCard {group} {history} />
      {/each}
    </div>
  </div>
{/await}
