<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import type { WorkflowEvents } from '$lib/types/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { isPureWorkflowTaskFailedEvent } from '$lib/utilities/is-event-type';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import GroupCard from './group-card.svelte';

  let { namespace, workflowId, runId, index } = $props();

  let workflowRunController: AbortController;

  const workflowUrl = $derived(
    routeForEventHistory({
      namespace,
      workflow: workflowId,
      run: runId,
    }),
  );

  const getWorkflowAndEventHistory = async (): Promise<
    [WorkflowEvents, EventGroups, string | null]
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
    const resetEvent = findResetEventId(history);
    const resetEventId = resetEvent ? resetEvent.id : null;
    // const baseRunId = resetEvent ? resetEvent.attributes.baseRunId : null;
    const reverseGroups = [
      ...groupEvents(history, 'ascending', [], []),
    ].reverse();
    const groups =
      index === 0
        ? reverseGroups
        : reverseGroups.filter(
            (group) => parseInt(group.eventList[0].id) > parseInt(resetEventId),
          );
    return [history, groups, resetEventId];
  };

  const findResetEventId = (history: WorkflowEvents) => {
    const workflowResetEvent = history.findLast(
      (e) =>
        isPureWorkflowTaskFailedEvent(e) &&
        e.workflowTaskFailedEventAttributes.cause ===
          'WORKFLOW_TASK_FAILED_CAUSE_RESET_WORKFLOW',
    );
    if (!workflowResetEvent) return null;
    return workflowResetEvent;
  };

  const _abortPolling = () => {
    if (workflowRunController) {
      workflowRunController.abort();
    }
  };
</script>

<div
  class="surface-primary flex w-full min-w-[320px] max-w-md flex-col border-r border-subtle"
>
  {#await getWorkflowAndEventHistory()}
    <div class="z-10 p-3">
      <div class="flex flex-1 justify-between">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold">Resetting...</h3>
        </div>
      </div>
      <div class="mt-1 flex items-center gap-2 text-xs text-secondary"></div>
    </div>
    <div class="flex flex-col gap-2 p-3">
      <Skeleton class="h-16 w-full rounded-none p-3" />
      <Skeleton class="h-32 w-full rounded-none p-3" />
      <Skeleton class="h-32 w-full rounded-none p-3" />
    </div>
  {:then [history, groups, resetEventId]}
    {@const workflowEvents =
      getWorkflowStartedCompletedAndTaskFailedEvents(history)}

    <div class="z-10 p-3">
      <div class="flex flex-1 justify-between">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold">
            {resetEventId ? `Reset ${index + 1}` : 'Original'}
          </h3>
        </div>
      </div>
      <div class="mt-1 flex items-center gap-2 text-xs text-secondary">
        <Link href={workflowUrl} target="_blank" class="truncate text-xs"
          >{runId}</Link
        >
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      <div class="flex h-24 max-h-24 flex-col gap-2 overflow-auto p-2">
        <PayloadDecoder
          value={parseWithBigInt(workflowEvents.results)}
          key="payloads"
        >
          {#snippet children(decodedValue)}
            <CodeBlock content={decodedValue} />
          {/snippet}
        </PayloadDecoder>
      </div>
      <div class="flex w-full flex-col gap-2 px-2">
        {#each groups as group}
          <GroupCard {group} {history} {index} />
        {/each}
      </div>
    </div>
  {/await}
</div>
