<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import WorkflowFamilyNodeDescriptionTree from './workflow-family-node-description-tree.svelte';
  import WorkflowFamilyNodeTree from './workflow-family-node-tree.svelte';

  export let root: RootNode;

  $: ({ namespace, run } = $page.params);

  let expandAll = false;
  let activeWorkflow: WorkflowExecution | undefined = undefined;

  let openRuns = new Map<number, string>();

  const onExpandAll = () => {
    expandAll = !expandAll;
  };

  const onNodeClick = (node: RootNode, generation: number) => {
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
    activeWorkflow = node.workflow;
  };

  $: isCurrent = root.workflow.runId === run;
</script>

<div class="-mt-4 flex flex-col bg-primary lg:flex-row">
  <div
    class="flex h-auto w-full flex-col overflow-auto border-b border-subtle bg-secondary text-base lg:w-1/2 lg:border-0"
  >
    <div class="flex flex-col items-end border-r border-subtle pb-4 pt-6">
      <ToggleSwitch
        label={translate('common.view-all')}
        labelPosition="left"
        id="autorefresh"
        checked={expandAll}
        on:change={onExpandAll}
      />
    </div>
    <div
      class="flex w-full select-none {isCurrent &&
        'bg-indigo-200/20'} justify-between gap-1 border-b border-r border-subtle px-2 py-1 hover:surface-interactive-secondary"
    >
      <div class="flex max-w-fit items-center gap-3 truncate text-sm">
        <WorkflowStatus status={root.workflow.status} />
        <div class="shrink-1 flex flex-col items-start text-left leading-4">
          <p>{root.workflow.name}</p>
          <p>{root.workflow.id}</p>
        </div>
      </div>
      {#if !isCurrent}
        <Link
          href={routeForEventHistory({
            namespace,
            workflow: root.workflow.id,
            run: root.workflow.runId,
          })}
          newTab
          icon="external-link"
        ></Link>
      {/if}
    </div>
    <div class="flex flex-col gap-0">
      <WorkflowFamilyNodeDescriptionTree
        {root}
        {onNodeClick}
        {expandAll}
        {activeWorkflow}
        {openRuns}
      />
    </div>
  </div>
  <div class="w-full overflow-hidden lg:w-1/2">
    <ZoomSvg
      initialZoom={1.5}
      maxZoomOut={2.5}
      maxZoomIn={0.25}
      let:width
      let:height
      let:zoomLevel
    >
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
</div>
