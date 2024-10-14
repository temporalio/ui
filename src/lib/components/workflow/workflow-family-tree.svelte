<script lang="ts">
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import type { RootNode } from '$lib/services/workflow-service';

  // import { workflowRun } from '$lib/stores/workflow-run';
  import WorkflowFamilyNode from './workflow-family-node.svelte';

  // $: ({ workflow } = $workflowRun);

  export let root: RootNode;

  // $: currentNode =
  //   root?.workflow?.runId === workflow.runId &&
  //   root?.workflow?.id === workflow.id;
</script>

<div class="w-full rounded-xl border-2 border-subtle bg-primary">
  <ZoomSvg
    initialZoom={1}
    maxZoomOut={1.5}
    maxZoomIn={0.25}
    let:width
    let:height
    let:zoomLevel
    class="spin"
  >
    <WorkflowFamilyNode {root} {width} {height} {zoomLevel} />
  </ZoomSvg>
</div>
