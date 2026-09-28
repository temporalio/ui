<script lang="ts">
  import {
    type ExecutionIdentity,
    getExecutionKey,
  } from './data/identity-keys';
  import { projectWorkflowScene } from './scene/structure/project-workflow-scene';
  import type { WorkflowScene } from './scene/structure/types';
  import {
    getNextRunsByExecution,
    getTerminalEventsByExecution,
    getVisibleDebugEntries,
  } from './workflow-timeline-debug';

  import { useWorkflowTimeline } from './use-workflow-timeline.svelte';

  interface Props {
    identity: ExecutionIdentity;
  }

  let { identity }: Props = $props();

  const timeline = useWorkflowTimeline(() => identity);
  const rootExecutionKey = $derived(getExecutionKey(identity));
  const historiesByExecution = $derived(
    new Map(
      timeline.executionHistories.map((history) => [
        history.executionKey,
        history,
      ]),
    ),
  );
  const terminalEventsByExecution = $derived(
    getTerminalEventsByExecution(timeline.historyEvents),
  );
  const nextRunsByExecution = $derived(
    getNextRunsByExecution(timeline.executionGraph.relations),
  );
  const scene = $derived(
    projectWorkflowScene(
      timeline.executionGraph,
      timeline.timelineRows,
      rootExecutionKey,
    ),
  );
</script>

<div data-testid="new-workflow-timeline">
  <p>History events: {timeline.historyEvents.length}</p>
  <p>Lifecycle groups: {timeline.lifecycleGroups.length}</p>
  <p>Timeline rows: {timeline.timelineRows.length}</p>
  <p>Executions discovered: {timeline.executionGraph.executionsByKey.size}</p>
  <p>Execution relations: {timeline.executionGraph.relations.length}</p>
  <p>Execution histories: {timeline.executionHistories.length}</p>

  {#if scene}
    <ol>
      {@render workflowGroup(scene)}
    </ol>
  {/if}
</div>

{#snippet workflowGroup(group: WorkflowScene)}
  <li>
    <strong
      >Workflow {group.executions[0]?.execution.identity.workflowId}</strong
    >
    <ol>
      {#each group.executions as run (run.execution.executionKey)}
        {@const executionKey = run.execution.executionKey}
        {@const history = historiesByExecution.get(executionKey)}
        {@const terminalEvent = terminalEventsByExecution.get(executionKey)}
        {@const load = history?.load}
        {@const pages = load?.stats ?? load?.progress}
        <li>
          <strong>Run {run.execution.identity.runId}</strong>
          <span>
            · Load: {load?.status ?? 'pending'}
            ({(pages?.ascPages ?? 0) + (pages?.descPages ?? 0)} pages) · Stream: {history
              ?.stream.status ?? 'idle'}
            · {run.rowCount} rows · {run.childCount} children
          </span>
          {#if terminalEvent}
            <p>
              End: {terminalEvent.eventType} (event {terminalEvent.eventId})
              {#if nextRunsByExecution.has(executionKey)}
                → {nextRunsByExecution.get(executionKey)}
              {/if}
            </p>
          {/if}
          <ol>
            {#each getVisibleDebugEntries(run.entries) as entry (entry.kind === 'row' ? entry.row.rowKey : entry.initiatedEventKey)}
              {#if entry.kind === 'row'}
                {@const row = entry.row}
                {@const firstEventKey = row.eventKeys[0]}
                {@const eventType = firstEventKey
                  ? timeline.historyEventRepository.getEvent(firstEventKey)
                      ?.eventType
                  : undefined}
                <li>
                  {row.kind === 'event' ? (eventType ?? row.kind) : row.kind}
                  · Events {row.startEventId}–{row.endEventId}
                </li>
              {:else}
                <li>
                  Child initiated at parent event {entry.initiatedEventId}
                  <ol>
                    {@render workflowGroup(entry.workflow)}
                  </ol>
                </li>
              {/if}
            {/each}
          </ol>
        </li>
      {/each}
    </ol>
  </li>
{/snippet}
