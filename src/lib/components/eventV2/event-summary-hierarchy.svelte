<script lang="ts">
  import { Network, DataSet } from 'vis-network/standalone';
  import Button from '$lib/holocene/button.svelte';
  import { onMount } from 'svelte';
  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import type { ChildWorkflowClosedEvent } from '$lib/utilities/get-workflow-relationships';
  import WorkflowRelationshipsV2 from './workflow-relationships-v2.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  export let hasChildren: boolean;
  export let hasRelationships: boolean;
  export let first: string;
  export let parent: WorkflowIdentifier;
  export let children: ChildWorkflowClosedEvent[];
  export let pendingChildren: ChildWorkflowClosedEvent[];
  export let next: string;
  export let previous: string;

  let visualizationRef;
  let network;

  onMount(() => {
    const options = {
      manipulation: false,
      height: '100%',
      width: '100%',
      nodes: {
        shape: 'dot',
        size: 10,
        font: {
          size: 16,
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 2,
        shadow: true,
      },
      layout: {
        hierarchical: {
          enabled: true,
          levelSeparation: 100,
          direction: 'UD',
        },
      },
    };
    network = new Network(visualizationRef, { nodes: [], edges: [] }, options);
    return () => network.destroy();
  });

  const colors = {
    Unspecified: '#f3e8ff',
    Scheduled: '#f3e8ff',
    Open: '#f3e8ff',
    New: '#f3e8ff',
    Started: '#f3e8ff',
    Intitiated: '#f3e8ff',
    TimedOut: '#ffedd5',
    Failed: '#fca5a5',
    Canceled: '#fef9c3',
    Terminated: '#e4e4e7',
    Running: '#93c5fd',
    Completed: '#86efac',
  };

  $: {
    if (network) {
      let id = 1;
      const edges = new DataSet([]);
      const nodes = new DataSet([]);
      if ($workflowRun) {
        nodes.add([
          {
            id,
            label: 'Current Execution',
            group: 1,
            level: 1,
            font: { size: 16 },
            color: colors[$workflowRun.workflow.status],
          },
        ]);
        id += 1;
      }

      if (hasRelationships) {
        if (parent) {
          nodes.add({
            id: 0,
            label: 'Parent',
            group: 0,
            level: 0,
            font: { size: 16 },
            color: '#d8b4fe',
          });
          edges.add({ from: 0, to: 1 });
          id += 1;
        }

        if (first) {
          nodes.add({
            id,
            label: 'First',
            group: 2,
            level: 1,
            font: { size: 16 },
            color: '#e4e4e7',
          });
          edges.add({ from: 1, to: id });
          id += 1;
        }

        if (previous) {
          nodes.add({
            id,
            label: 'Previous',
            group: 2,
            level: 1,
            font: { size: 16 },
            color: '#e4e4e7',
          });
          edges.add({ from: 1, to: id });
          id += 1;
        }

        if (next) {
          nodes.add({
            id,
            label: 'Next',
            group: 2,
            level: 1,
            font: { size: 16 },
            color: '#e4e4e7',
          });
          edges.add({ from: 1, to: id });
          id += 1;
        }
        if (children.length) {
          children.forEach((child, i) => {
            nodes.add({
              id,
              label: 'Child',
              level: 2,
              group: 2,
              font: { size: 12 },
              color: colors[child.classification],
            });
            edges.add({ from: 1, to: id });
            id += 1;
          });
        }

        if (pendingChildren.length) {
          pendingChildren.forEach((child, i) => {
            nodes.add({
              id,
              label: 'Pending',
              level: 2,
              group: 3,
              font: { size: 16 },
              color: '#dbeafe',
            });
            edges.add({ from: 1, to: id });
            id += 1;
          });
        }
      }

      const data = {
        nodes: nodes,
        edges: edges,
      };

      network.setData(data);
    }
  }
</script>

<div
  class="flex flex-col gap-4 bg-white border-2 border-gray-900 rounded-xl p-4 h-full"
>
  <div class="flex justify-between items-center gap-2">
    <h3 class="text-xl">Hierarchy</h3>
    <div class="flex gap-1">
      <Button variant="secondary" on:click={() => network.fit()}
        >Zoom to Fit</Button
      >
    </div>
  </div>
  <div class="h-full" bind:this={visualizationRef} />
</div>

<style lang="postcss">
  :global(.vis-item-content) {
    width: 100%;
  }
</style>
