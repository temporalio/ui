<script lang="ts">
  import { setContext } from 'svelte';

  import TimelineGraph from '$lib/components/lines-and-dots/timeline-graph/timeline-graph.svelte';
  import {
    WORKFLOW_VIEW_CONTEXT,
    type WorkflowViewContext,
  } from '$lib/contexts/workflow-view-context';
  import { groupEvents } from '$lib/models/event-groups';
  import { toEventHistory } from '$lib/models/event-history';
  import { toWorkflowExecution } from '$lib/models/workflow-execution';

  import {
    type ChainRun,
    chainWorkflowStatus,
    type LiveRunState,
  } from './run-chain';
  import type { RunHistory } from './run-chain-reader';

  let {
    run,
    history,
    liveState,
    namespace,
    workflowId,
  }: {
    run: ChainRun;
    history?: RunHistory;
    liveState?: LiveRunState;
    namespace: string;
    workflowId: string;
  } = $props();

  let activeGroupId = $state('');
  const events = $derived(toEventHistory(history?.events ?? []));
  const workflow = $derived(
    toWorkflowExecution({
      workflowExecutionInfo: {
        assignedBuildId: '',
        stateTransitionCount: '0',
        historySizeBytes: '0',
        execution: { workflowId, runId: run.runId },
        type: history?.events[0]?.workflowExecutionStartedEventAttributes
          ?.workflowType,
        startTime: new Date(run.startTime).toISOString(),
        executionTime: new Date(run.startTime).toISOString(),
        closeTime:
          run.closeTime === undefined
            ? ''
            : new Date(run.closeTime).toISOString(),
        status: chainWorkflowStatus(run.status),
        historyLength: run.eventCount,
      },
      // The shared formatter simplifies pending metadata in place. Copy it
      // so this derived value never mutates the live response / Svelte state.
      pendingActivities:
        liveState?.runId === run.runId && run.status === 'Running'
          ? liveState.pendingActivities.map((activity) => ({ ...activity }))
          : [],
    }),
  );
  const groups = $derived(
    groupEvents(events, 'ascending', workflow.pendingActivities),
  );
  setContext<WorkflowViewContext>(WORKFLOW_VIEW_CONTEXT, {
    get namespace() {
      return namespace;
    },
    get workflow() {
      return workflow;
    },
    get events() {
      return events;
    },
  });
</script>

{#if history}
  <TimelineGraph
    {workflow}
    eventHistory={events}
    lazyGroups={groups}
    loading={history.hasMore}
    totalExpectedEvents={Math.max(
      groups.length,
      Math.ceil(Number(run.eventCount) / 2),
    )}
    {activeGroupId}
    onSelectGroup={(group) => {
      activeGroupId = activeGroupId === group.id ? '' : group.id;
    }}
  />
{:else}
  <p class="p-4 text-xs text-secondary" role="status">Loading Timeline…</p>
{/if}
