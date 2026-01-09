<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    fetchAllDirectWorkflows,
    type RootNode,
  } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import { showFullTree } from '../workflow-relationships.svelte';

  import WorkflowFamilyNodeDescription from './workflow-family-node-description.svelte';
  import WorkflowFamilyNodeTree from './workflow-family-node-tree.svelte';

  export let root: RootNode;
  export let namespace: string;

  $: expandAll = !$showFullTree;
  let activeWorkflow: WorkflowExecution | undefined = undefined;
  let openRuns = new Map<number, string>();

  const onExpandAll = () => {
    expandAll = !expandAll;
  };

  const onNodeClick = async (node: RootNode, generation: number) => {
    if ($showFullTree) {
      const newRuns = new Map(openRuns);
      const highestGeneration = Math.max(...Array.from(newRuns.keys()));

      if (openRuns.get(generation) === node.workflow.runId) {
        newRuns.set(generation, '');
      } else {
        newRuns.set(generation, node.workflow.runId);
      }

      if (generation < highestGeneration) {
        for (let i = generation + 1; i <= highestGeneration; i++) {
          newRuns.delete(i);
        }
      }

      openRuns = newRuns;
    } else {
      root = await fetchAllDirectWorkflows({
        namespace,
        workflow: node.workflow,
        parentWorkflowId: node.workflow?.parent?.workflowId,
        parentRunId: node.workflow?.parent?.runId,
      });
    }
    activeWorkflow = node.workflow;
  };
</script>

<div class="flex flex-col bg-primary">
  <div
    class="relative z-10 w-full overflow-hidden border-b border-subtle bg-primary lg:sticky lg:top-12"
  >
    <ZoomSvg
      initialZoom={2}
      maxZoomOut={8}
      maxZoomIn={0.25}
      containerHeight={450}
      let:width
      let:height
      let:zoomLevel
    >
      <div class="flex py-4" slot="controls">
        {#if $showFullTree}
          <ToggleSwitch
            label={translate('common.expand-all')}
            labelPosition="left"
            id="autorefresh"
            checked={expandAll}
            on:change={onExpandAll}
          />
        {/if}
      </div>
      <WorkflowFamilyNodeTree
        {root}
        {width}
        {height}
        {zoomLevel}
        {onNodeClick}
        {expandAll}
        {openRuns}
        {activeWorkflow}
      />
    </ZoomSvg>
  </div>
  <div
    class="surface-secondary flex h-auto w-full flex-col overflow-auto text-base"
  >
    <WorkflowFamilyNodeDescription
      {root}
      {expandAll}
      {onNodeClick}
      {activeWorkflow}
      {openRuns}
    />
  </div>
</div>
