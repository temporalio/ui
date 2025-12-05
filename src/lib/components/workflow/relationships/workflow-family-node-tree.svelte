<script lang="ts">
  import { cva } from 'class-variance-authority';

  import { page } from '$app/state';

  import Icon from '$lib/holocene/icon';
  import type { RootNode } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import {
    routeForRelationships,
    routeForSchedule,
  } from '$lib/utilities/route-for';

  import { showFullTree } from '../workflow-relationships.svelte';

  export let root: RootNode;
  export let width: number;
  export let height: number;
  export let zoomLevel: number;
  export let rootX = 0;
  export let rootY = 0;
  export let generation = 1;
  export let openRuns: Map<number, string>;
  export let expandAll: boolean;
  export let onNodeClick: (node: RootNode, generation: number) => void;
  export let activeWorkflow: WorkflowExecution | undefined = undefined;

  $: ({ workflow, run, namespace } = page.params);
  $: ({ workflow: fullWorkflow } = $workflowRun);
  $: workflowRelationships = getWorkflowRelationships(
    fullWorkflow,
    $fullEventHistory,
    page.data.namespace,
  );
  $: ({ first, next, previous } = workflowRelationships);

  const getPositions = (
    width: number,
    height: number,
    rootX: number,
    rootY: number,
  ) => {
    const x = rootX || width / 2;
    const y = rootY || height / 3;
    const radius = 20;
    return {
      x,
      y,
      radius,
    };
  };

  $: ({ x, y, radius } = getPositions(width, height, rootX, rootY));

  $: getPosition = (index: number) => {
    const childY = y + 4 * radius;

    const getX = () => {
      const numberOfSiblings = root.children?.length;
      if (numberOfSiblings === 1) return x;
      const expandFactor = (radius * 6) / zoomLevel;
      if (numberOfSiblings % 2 === 0) {
        return (
          x + (index - numberOfSiblings * 0.5) * expandFactor + expandFactor / 2
        );
      } else {
        const middleIndex = numberOfSiblings / 2 - 0.5;
        if (index === middleIndex) return x;
        return x + (index - middleIndex) * expandFactor;
      }
    };

    return { childX: getX(), childY };
  };

  const nodeClick = (e, node: RootNode) => {
    e.stopPropagation();
    onNodeClick(node, generation);
  };

  $: isExpanded = (node: RootNode) => {
    const opened = openRuns.get(generation) === node.workflow.runId;
    return expandAll || opened;
  };

  $: isCurrent = (node: RootNode) => {
    return node.workflow.id === workflow && node.workflow.runId === run;
  };

  $: isActive = (node: RootNode) => {
    return node.workflow.runId === activeWorkflow?.runId;
  };

  const workflowStatus = cva(['stroke-2'], {
    variants: {
      status: {
        Running: 'fill-blue-300 stroke-blue-500',
        TimedOut: 'fill-orange-200 stroke-orange-400',
        Completed: 'fill-green-200 stroke-green-400',
        Failed: 'fill-red-200 stroke-red-400',
        ContinuedAsNew: 'fill-purple-200 stroke-purple-400',
        Canceled: 'fill-slate-100 stroke-slate-300',
        Terminated: 'fill-yellow-200 stroke-yellow-400',
        Paused: 'fill-yellow-200 stroke-yellow-400',
        Unspecified: 'fill-slate-100 stroke-slate-300',
        Scheduled: 'fill-blue-300 stroke-blue-500',
        Started: 'fill-blue-300 stroke-blue-500',
        Open: 'fill-green-200 stroke-green-400',
        New: 'fill-blue-300 stroke-blue-500',
        Initiated: 'fill-blue-300 stroke-blue-500',
        Fired: 'fill-pink-200 stroke-pink-400',
        CancelRequested: 'fill-yellow-200 stroke-yellow-400',
        Signaled: 'fill-pink-200 stroke-pink-400',
      },
    },
  });
</script>

{#if root?.children.length}
  <line
    x1={getPosition(0).childX}
    y1={getPosition(0).childY - 1.5 * radius}
    x2={getPosition(root?.children.length - 1).childX}
    y2={getPosition(0).childY - 1.5 * radius}
    class="stroke-2 transition-all duration-300 ease-in-out {isActive(root)
      ? 'stroke-indigo-700'
      : 'stroke-slate-100 dark:stroke-slate-800'}"
  />
{/if}
{#each root?.children as child, index}
  {@const { childX, childY } = getPosition(index)}
  {#if child.children.length && isExpanded(child)}
    <svelte:self
      root={child}
      {width}
      {height}
      {zoomLevel}
      rootX={childX}
      rootY={childY}
      generation={generation + 1}
      {expandAll}
      {openRuns}
      {onNodeClick}
      {activeWorkflow}
    />
  {/if}
  <line
    x1={childX}
    y1={childY - 1.5 * radius}
    x2={childX}
    y2={childY}
    class="stroke-2 transition-all duration-300 ease-in-out {isActive(root)
      ? 'stroke-indigo-700'
      : 'stroke-slate-100 dark:stroke-slate-800'}"
  />
  <g
    role="button"
    tabindex="0"
    class="outline-none transition-all"
    on:click={(e) => nodeClick(e, child)}
    on:keypress={(e) => nodeClick(e, child)}
  >
    {#if child?.children?.length && isExpanded(child)}
      <line
        x1={childX}
        y1={childY}
        x2={childX}
        y2={childY + 2.5 * radius}
        class="stroke-2 duration-300 ease-in-out {isActive(child)
          ? 'stroke-indigo-700'
          : 'stroke-slate-100 dark:stroke-slate-800'}"
      />
    {/if}
    {#if isActive(child)}
      <circle
        cx={childX}
        cy={childY}
        r={radius}
        class="fill-indigo-700"
        fill-opacity=".95"
      />
    {/if}
    {#if isCurrent(child)}
      <circle
        cx={childX}
        cy={childY}
        r={radius}
        class="fill-indigo-200"
        fill-opacity=".75"
      />
    {/if}
    <rect
      class={workflowStatus({ status: child.workflow.status })}
      x={childX - radius / 2}
      y={childY - radius / 2}
      cx={radius / 2}
      cy={radius / 2}
      width={radius}
      height={radius}
      cursor="pointer"
    />
    {#if child?.children?.length && !isExpanded(child)}
      <text
        x={childX}
        y={childY + 2 * radius}
        class="text-center font-mono"
        fill="currentColor"
        text-anchor="middle"
        font-weight="500">{child.children.length}</text
      >
    {/if}
    {#if !$showFullTree}
      <text
        x={!child?.children?.length ? childX : childX + 8}
        y={!child?.children?.length
          ? childY + 1.15 * radius
          : childY - 1.15 * radius}
        class={!child?.children?.length && '[writing-mode:vertical-lr]'}
        fill="currentcolor"
        text-anchor={!child?.children?.length ? 'start' : 'start'}
        font-weight="500">{child.workflow.id}</text
      >
    {/if}
  </g>
  {#if !$showFullTree && child.siblingCount > 0}
    <line
      x1={x}
      y1={y}
      x2={x - 4 * radius}
      y2={y}
      class="stroke-slate-50 stroke-2 duration-300 ease-in-out dark:stroke-slate-900"
    />
    <rect
      class="fill-white stroke-slate-50 dark:fill-space-black dark:stroke-slate-900"
      x={x - 3 * radius - radius / 2}
      y={y - radius / 4}
      cx={radius / 2}
      cy={radius / 2}
      width={radius / 2}
      height={radius / 2}
    />
    <rect
      class="fill-white stroke-slate-50 dark:fill-space-black dark:stroke-slate-900"
      x={x - 1.5 * radius - radius / 2}
      y={y - radius / 4}
      cx={radius / 2}
      cy={radius / 2}
      width={radius / 2}
      height={radius / 2}
    />
    <line
      x1={x}
      y1={y}
      x2={x + 4 * radius}
      y2={y}
      class="stroke-slate-50 stroke-2 duration-300 ease-in-out dark:stroke-slate-900"
    />
    <rect
      class="fill-white stroke-slate-50 dark:fill-space-black dark:stroke-slate-900"
      x={x + 1.5 * radius}
      y={y - radius / 4}
      cx={radius / 2}
      cy={radius / 2}
      width={radius / 2}
      height={radius / 2}
    />
    <rect
      class="fill-white stroke-slate-50 dark:fill-space-black dark:stroke-slate-900"
      x={x + 3 * radius}
      y={y - radius / 4}
      cx={radius / 2}
      cy={radius / 2}
      width={radius / 2}
      height={radius / 2}
    />
  {/if}
{/each}

{#if generation === 1}
  <g
    role="button"
    class="outline-none"
    tabindex="0"
    on:click={(e) => nodeClick(e, root)}
    on:keypress={(e) => nodeClick(e, root)}
  >
    {#if root?.scheduleId}
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y - 2.5 * radius}
        stroke-dasharray="3 2"
        class="stroke-slate-100 stroke-2 transition-all duration-300 ease-in-out dark:stroke-slate-800"
      />
      <line
        x1={x - 5 * radius}
        y1={y - 2.5 * radius}
        x2={x}
        y2={y - 2.5 * radius}
        stroke-dasharray="3 2"
        class="stroke-slate-100 stroke-2 transition-all duration-300 ease-in-out dark:stroke-slate-800"
      />
      <Icon x={x - 9.25 * radius} y={y - 4.15 * radius} name="schedules" />
      <text
        x={x - 5.25 * radius}
        y={y - 3.5 * radius}
        fill="currentColor"
        text-anchor="end"
        font-weight="500">Schedule</text
      >
      <a href={routeForSchedule({ namespace, scheduleId: root.scheduleId })}>
        <text
          x={x - 5.25 * radius}
          y={y - 2.5 * radius}
          fill="currentColor"
          text-decoration="underline"
          text-anchor="end"
          font-weight="500">{root.scheduleId}</text
        >
      </a>
    {/if}
    {#if next}
      <line
        x1={x}
        y1={y}
        x2={x + 4 * radius}
        y2={y}
        class="stroke-slate-100 stroke-2 transition-all duration-300 ease-in-out dark:stroke-slate-800"
      />
      <text
        x={x + 4.25 * radius}
        y={y - 4}
        fill="currentColor"
        text-anchor="start"
        font-weight="500">Next Execution</text
      >
      <a href={routeForRelationships({ namespace, workflow, run: next })}>
        <text
          x={x + 4.25 * radius}
          y={y + radius - 4}
          fill="currentColor"
          text-decoration="underline"
          text-anchor="start"
          font-weight="500">{next}</text
        >
      </a>
    {/if}
    {#if previous}
      <line
        x1={x}
        y1={y}
        x2={x - 4 * radius}
        y2={y}
        class="stroke-slate-100 stroke-2 transition-all duration-300 ease-in-out dark:stroke-slate-800"
      />
      <text
        x={x - 4.25 * radius}
        y={y - 4}
        fill="currentColor"
        text-anchor="end"
        font-weight="500"
        >{previous === first ? 'First' : 'Previous'} Execution</text
      >
      <a href={routeForRelationships({ namespace, workflow, run: previous })}>
        <text
          href={routeForRelationships({ namespace, workflow, run: previous })}
          x={x - 4.25 * radius}
          y={y + radius - 4}
          fill="currentColor"
          text-decoration="underline"
          text-anchor="end"
          font-weight="500">{previous}</text
        >
      </a>
    {/if}
    {#if first && previous !== first}
      <line
        x1={previous ? x - 4 * radius : x}
        y1={y}
        x2={radius}
        y2={y}
        stroke-dasharray="3 2"
        class="stroke-slate-100 stroke-2 transition-all duration-300 ease-in-out dark:stroke-slate-800"
      />
      <text
        x={radius}
        y={y - 4}
        fill="currentColor"
        text-anchor="start"
        font-weight="500">First Execution</text
      >
      <a href={routeForRelationships({ namespace, workflow, run: first })}>
        <text
          x={radius}
          y={y + radius - 4}
          fill="currentColor"
          text-decoration="underline"
          text-anchor="start"
          font-weight="500">{first}</text
        >
      </a>
    {/if}
    {#if root?.children?.length}
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y + 2.5 * radius}
        class="stroke-2 transition-all duration-300 ease-in-out {isActive(root)
          ? 'stroke-indigo-700'
          : 'stroke-slate-100 dark:stroke-slate-800'}"
      />
    {/if}
    {#if isCurrent(root)}
      <circle
        cx={x}
        cy={y}
        r={radius}
        class="fill-indigo-200"
        fill-opacity=".75"
      />
    {/if}
    {#if isActive(root)}
      <circle
        cx={x}
        cy={y}
        r={radius}
        class="fill-indigo-700"
        fill-opacity=".95"
      />
    {/if}
    <rect
      class={workflowStatus({ status: root.workflow.status })}
      x={x - radius / 2}
      y={y - radius / 2}
      width={radius}
      height={radius}
      cx={radius / 2}
      cy={radius / 2}
    />
    {#if root?.children?.length}
      <text
        {x}
        y={y - 1.25 * radius}
        class="text-center {$showFullTree && 'font-mono'}"
        fill="currentColor"
        text-anchor="middle"
        font-weight="500"
        >{$showFullTree ? root.children.length : root.workflow.id}</text
      >
    {/if}
  </g>
{/if}
