<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow-status.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { WorkflowExecution, WorkflowStatus } from '$lib/types/workflows';

  export let workflows: WorkflowExecution[] = [];

  type Bar = {
    key: string;
    workflowType: string;
    startTime: string;
    status: WorkflowStatus;
    statusLabel: string;
    left: number;
    color: string;
  };

  const dispatch = createEventDispatcher<{ filter: string }>();

  type StatusColorKey = Exclude<WorkflowStatus, null>;

  const statusColors: Partial<Record<StatusColorKey, string>> = {
    Running: '#93c5fd',
    TimedOut: '#fed7aa',
    Completed: '#bbf7d0',
    Failed: '#fecaca',
    ContinuedAsNew: '#e9d5ff',
    Canceled: '#f1f5f9',
    Terminated: '#fef08a',
    Paused: '#fef08a',
  };

  const getStartTimestamp = (workflow: WorkflowExecution): number => {
    return new Date(workflow.startTime).getTime();
  };

  const getStatusColor = (status: WorkflowStatus): string => {
    return status ? (statusColors[status] ?? '#cbd5e1') : '#cbd5e1';
  };

  const toBar = (
    workflow: WorkflowExecution,
    minStart: number,
    duration: number,
  ): Bar => {
    const workflowType = workflow.name || 'Unknown workflow type';
    const startTimestamp = getStartTimestamp(workflow);
    const left = duration ? ((startTimestamp - minStart) / duration) * 100 : 50;

    return {
      key: `${workflow.id}:${workflow.runId}`,
      workflowType,
      startTime: workflow.startTime,
      status: workflow.status,
      statusLabel: workflow.status ?? 'Unknown',
      left,
      color: getStatusColor(workflow.status),
    };
  };

  $: sortedWorkflows = [...workflows]
    .filter((workflow) => Number.isFinite(getStartTimestamp(workflow)))
    .sort((a, b) => getStartTimestamp(a) - getStartTimestamp(b));

  $: minStart = sortedWorkflows.length
    ? getStartTimestamp(sortedWorkflows[0])
    : 0;
  $: maxStart = sortedWorkflows.length
    ? getStartTimestamp(sortedWorkflows[sortedWorkflows.length - 1])
    : 0;
  $: duration = maxStart - minStart;
  $: bars = sortedWorkflows.map((workflow) =>
    toBar(workflow, minStart, duration),
  );
</script>

{#if bars.length}
  <div class="w-full">
    <div
      class="relative h-8 w-full bg-subtle/40"
      aria-label="Workflow start overview"
    >
      {#each bars as bar (bar.key)}
        <div
          class="absolute top-0 h-full w-4 -translate-x-2"
          style:left={`${bar.left}%`}
        >
          <Tooltip top usePortal class="h-full w-full">
            <svelte:fragment slot="content">
              <div class="flex flex-col gap-1 text-left">
                <div class="flex items-center gap-2">
                  <span>{bar.workflowType}</span>
                  {#if bar.status}
                    <WorkflowStatusBadge status={bar.status} />
                  {:else}
                    <span class="text-slate-300">{bar.statusLabel}</span>
                  {/if}
                </div>
                <span class="text-slate-300">{$timestamp(bar.startTime)}</span>
              </div>
            </svelte:fragment>
            <button
              class="workflow-start-bar relative h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style:--bar-color={bar.color}
              aria-label={`Filter by workflow type ${bar.workflowType}`}
              on:click={() => dispatch('filter', bar.workflowType)}
            >
              <span class="sr-only">
                {bar.workflowType} - {bar.statusLabel} - {$timestamp(
                  bar.startTime,
                )}
              </span>
            </button>
          </Tooltip>
        </div>
      {/each}
    </div>

    <div class="mt-1 flex justify-between text-xs text-secondary">
      <span>{$timestamp(sortedWorkflows[0].startTime)}</span>
      <span
        >{$timestamp(
          sortedWorkflows[sortedWorkflows.length - 1].startTime,
        )}</span
      >
    </div>
  </div>
{/if}

<style lang="postcss">
  .workflow-start-bar::before {
    @apply absolute left-1/2 top-1/2 block h-7 w-0.5 -translate-x-1/2 -translate-y-1/2 content-[''];

    background-color: var(--bar-color);
  }

  .workflow-start-bar:hover::before,
  .workflow-start-bar:focus-visible::before {
    @apply h-9 w-1;
  }
</style>
