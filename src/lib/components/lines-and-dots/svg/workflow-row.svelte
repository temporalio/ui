<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import { CompactConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let workflow: WorkflowExecution;
  export let length: number;
  export let y: number;
  export let active = true;

  const { radius, height } = CompactConfig;

  $: start = 2 * radius;
  $: end = start + length;
</script>

<g role="button" tabindex="0" class="relative cursor-pointer" {height}>
  <Line
    startPoint={[start, y]}
    endPoint={[end, y]}
    classification={workflow.status}
    {active}
    strokeWidth={radius * 2}
  />
  <Line
    startPoint={[start, y]}
    endPoint={[end, y]}
    {active}
    status="none"
    strokeWidth={radius}
  />
  <Text point={[start + (4 / 3) * radius, y]} {active} fontWeight="500">
    {workflow.name}
  </Text>
  <Dot
    point={[start, y]}
    classification={workflow.status}
    {active}
    r={radius}
  />
  <Icon
    name="workflow"
    x={start - radius / 1.35}
    y={y - radius / 1.35}
    width={radius * 1.5}
    height={radius * 1.5}
    strokeWidth="4"
    class="text-black"
    noDivWrapper
  />
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
