<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import { TimelineConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';

  export let workflow: WorkflowExecution;
  export let length: number;
  export let y: number;

  const { radius, height, gutter } = TimelineConfig;

  $: start = gutter;
  $: end = start + length - 2 * gutter;
</script>

<g role="button" tabindex="0" class="relative cursor-pointer" {height}>
  <Line
    startPoint={[start, y]}
    endPoint={[end, y]}
    classification={workflow.status}
    strokeWidth={radius * 2}
    pending={workflow.isRunning}
  />
  <Dot point={[start, y]} classification={workflow.status} r={radius} />
  <Icon
    name="workflow"
    x={start - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    strokeWidth="4"
    className="text-black"
  />
  <Dot point={[end, y]} classification={workflow.status} r={radius} />
  <Icon
    name="workflow"
    x={end - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    strokeWidth="4"
    className="text-black"
  />
</g>

<style lang="postcss">
  g {
    cursor: default;
    pointer-events: bounding-box;
    outline: none;
  }
</style>
