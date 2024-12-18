<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowFamilyNodeDescriptionTree from './workflow-family-node-description-tree.svelte';
  import WorkflowFamilyNodeTree from './workflow-family-node-tree.svelte';

  export let root: RootNode;

  let expandAll = false;
  let activeWorkflow: WorkflowExecution | undefined = undefined;

  let openRuns = {};

  const onExpandAll = () => {
    expandAll = !expandAll;
  };

  const onNodeClick = (node: RootNode) => {
    if (openRuns[node.workflow.runId]) {
      openRuns[node.workflow.runId] = false;
    } else {
      openRuns[node.workflow.runId] = true;
    }
  };
</script>

<div class="-mt-4 flex flex-col lg:flex-row">
  <div
    class="flex w-full flex-col border-b border-subtle text-base lg:w-1/3 lg:border-0"
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
    <button
      class="w-full select-none border border-subtle px-4 py-2 text-sm hover:surface-interactive-secondary"
    >
      {root.workflow.name}
    </button>
    <div class="flex flex-col gap-0">
      <WorkflowFamilyNodeDescriptionTree
        {root}
        {onNodeClick}
        {expandAll}
        {activeWorkflow}
      />
    </div>
  </div>
  <div class="w-full overflow-hidden lg:w-2/3">
    <ZoomSvg
      initialZoom={1.5}
      maxZoomOut={2.5}
      maxZoomIn={0.25}
      let:width
      let:height
      let:zoomLevel
      class="spin"
    >
      <WorkflowFamilyNodeTree
        {root}
        {width}
        {height}
        {zoomLevel}
        {onNodeClick}
        {expandAll}
        {openRuns}
      />
    </ZoomSvg>
  </div>
</div>
