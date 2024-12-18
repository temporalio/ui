<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowFamilyNodeDescriptionTree from './workflow-family-node-description-tree.svelte';
  import WorkflowFamilyNode from './workflow-family-node.svelte';

  export let root: RootNode;

  let expandAll = false;
  let activeWorkflow: WorkflowExecution | undefined = undefined;

  const onExpandAll = () => {
    expandAll = !expandAll;
  };

  const onNodeClick = (node: RootNode) => {
    console.log(node);
    if (
      node.workflow.id === activeWorkflow?.id &&
      node.workflow.runId === activeWorkflow?.runId
    ) {
      activeWorkflow = undefined;
    } else {
      activeWorkflow = node.workflow;
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
      class="w-full select-none border border-subtle px-4 py-2 hover:surface-interactive-secondary"
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
      maxZoomOut={1.5}
      maxZoomIn={0.25}
      let:width
      let:height
      let:zoomLevel
      class="spin"
    >
      <WorkflowFamilyNode
        {root}
        {width}
        {height}
        {zoomLevel}
        {onNodeClick}
        {expandAll}
        {activeWorkflow}
      />
    </ZoomSvg>
  </div>
</div>
