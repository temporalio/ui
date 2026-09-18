<script lang="ts">
  import {
    type ExecutionIdentity,
    getExecutionKey,
  } from './data/identity-keys';
  import { orderTimelineRows } from './scene/timeline-rows/order-timeline-rows';

  import { useWorkflowTimeline } from './use-workflow-timeline.svelte';

  interface Props {
    identity: ExecutionIdentity;
  }

  let { identity }: Props = $props();

  const timeline = useWorkflowTimeline(() => identity);
  const rootExecutionKey = $derived(getExecutionKey(identity));
  const rootExecutionHistory = $derived(
    timeline.executionHistories.find(
      (executionHistory) => executionHistory.executionKey === rootExecutionKey,
    ),
  );
  const visibleTimelineRows = $derived(
    orderTimelineRows(timeline.timelineRows, 'ascending').slice(0, 50),
  );
</script>

<div data-testid="new-workflow-timeline">
  <p>Load status: {rootExecutionHistory?.load.status ?? 'pending'}</p>
  <p>Stream status: {rootExecutionHistory?.stream.status ?? 'idle'}</p>
  <p>History events: {timeline.historyEvents.length}</p>
  <p>Lifecycle groups: {timeline.lifecycleGroups.length}</p>
  <p>Timeline rows: {timeline.timelineRows.length}</p>
  <p>Executions discovered: {timeline.executionGraph.executions.length}</p>
  <p>Execution relations: {timeline.executionGraph.relations.length}</p>
  <p>Execution histories: {timeline.executionHistories.length}</p>
  {#if rootExecutionHistory?.load.progress}
    <p>
      Pages loaded:
      {rootExecutionHistory.load.progress.ascPages +
        rootExecutionHistory.load.progress.descPages}
    </p>
  {/if}

  <ol>
    {#each visibleTimelineRows as row (row.rowKey)}
      {@const startTime = new Date(row.startTimeMs).toISOString()}
      {@const endTime = new Date(row.endTimeMs).toISOString()}
      <li>
        <strong>{row.kind}</strong>
        <span>
          Events {row.startEventId}–{row.endEventId}
          ({row.eventKeys.length})
        </span>
        <time datetime={startTime}>{startTime}</time>
        <span>–</span>
        <time datetime={endTime}>{endTime}</time>
      </li>
    {/each}
  </ol>
</div>
