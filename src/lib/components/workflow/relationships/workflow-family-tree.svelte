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

    if (activeWorkflow?.runId === node.workflow.runId) {
      activeWorkflow = undefined;
    } else {
      activeWorkflow = node.workflow;
    }
  };

  $: isCurrent = root.workflow.runId === run;
</script>

<div class="-mt-4 flex flex-col bg-primary lg:flex-row">
  <div
    class="flex w-full flex-col border-b border-subtle bg-secondary text-base lg:w-1/3 lg:border-0"
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
      <Link
        href={routeForEventHistory({
          namespace,
          workflow: root.workflow.id,
          run: root.workflow.runId,
        })}
        newTab
        icon="external-link"
      ></Link>
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
  <div class="w-full overflow-hidden lg:w-2/3">
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
