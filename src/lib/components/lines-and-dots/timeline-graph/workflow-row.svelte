<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-status-label';

  import { TimelineConfig } from '../constants';
  import Dot from '../svg/dot.svelte';
  import Line from '../svg/line.svelte';
  import TimelineIcon from '../svg/timeline-icon.svelte';

  interface Props {
    workflow: WorkflowExecution;
    length: number;
    y: number;
  }

  let { workflow, length, y }: Props = $props();

  const { radius, height, gutter } = TimelineConfig;

  const start = $derived(gutter);
  const end = $derived(start + length - 2 * gutter);

  const accessibleName = $derived(
    translate('workflows.row-accessible-name', {
      workflowId: workflow.id,
      status: getWorkflowStatusLabel(workflow.status),
    }),
  );
</script>

<g
  role="button"
  tabindex="0"
  aria-label={accessibleName}
  class="relative cursor-pointer"
  {height}
>
  <Line
    startPoint={[start, y]}
    endPoint={[end, y]}
    status={workflow.status}
    strokeWidth={radius * 2}
    pending={workflow.isRunning}
    delayed={isWorkflowDelayed(workflow)}
  />
  <Dot point={[start, y]} classification={workflow.status} r={radius} />
  <TimelineIcon
    name="workflow"
    x={start - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    class="text-black"
  />
  <Dot point={[end, y]} classification={workflow.status} r={radius} />
  <TimelineIcon
    name="workflow"
    x={end - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    class="text-black"
  />
</g>

<style lang="postcss">
  g {
    cursor: default;
    pointer-events: bounding-box;
    outline: none;
  }
</style>
