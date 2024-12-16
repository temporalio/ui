<script lang="ts">
  // import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowFamilyNodeDescription from './workflow-family-node-description.svelte';
  import WorkflowFamilyNode from './workflow-family-node.svelte';

  // $: ({ namespace } = $page.params);
  export let root: RootNode;

  let expandAll = false;

  // $: currentNode =
  //   root?.workflow?.runId === workflow.runId &&
  //   root?.workflow?.id === workflow.id;

  const onExpandAll = () => {
    expandAll = !expandAll;
  };

  let workflow: WorkflowExecution | undefined = undefined;

  const onNodeClick = (node: RootNode) => {
    if (
      node.workflow.id === workflow?.id &&
      node.workflow.runId === workflow?.runId
    ) {
      workflow = undefined;
    } else {
      workflow = node.workflow;
    }
  };
</script>

<div class="flex">
  <div class="flex h-full w-96 flex-col text-base">
    <div class="flex flex-col items-end">
      <ToggleSwitch
        label={translate('common.view-all')}
        labelPosition="left"
        id="autorefresh"
        checked={expandAll}
        on:change={onExpandAll}
      />
    </div>
    <div class="flex items-center gap-3 border-b border-subtle">
      <Icon name="chevron-down" />{root.workflow.name}
    </div>
    <WorkflowFamilyNodeDescription {root} {onNodeClick} {expandAll} />
  </div>
  <div class="w-full overflow-hidden">
    <ZoomSvg
      initialZoom={1}
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
      />
    </ZoomSvg>
  </div>
</div>
