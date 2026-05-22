<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';

  import { TimelineConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';

  interface Props {
    workflow: WorkflowExecution;
    length: number;
    y: number;
  }

  let { workflow, length, y }: Props = $props();

  const { radius, height, gutter } = TimelineConfig;

  const start = $derived(gutter);
  const end = $derived(start + length - 2 * gutter);

  const workflowStatusKey = (status: WorkflowExecution['status']) => {
    if (!status) return 'unknown';
    if (status === 'TimedOut') return 'timed-out';
    if (status === 'ContinuedAsNew') return 'continued-as-new';
    return status.toLowerCase();
  };

  const statusLabel = $derived(
    workflow.status
      ? translate(`workflows.${workflowStatusKey(workflow.status)}`)
      : translate('common.unknown'),
  );

  const accessibleName = $derived(
    translate('workflows.row-accessible-name', {
      workflowId: workflow.id,
      status: statusLabel,
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
  <Icon
    name="workflow"
    x={start - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    strokeWidth="4"
    class="text-black"
  />
  <Dot point={[end, y]} classification={workflow.status} r={radius} />
  <Icon
    name="workflow"
    x={end - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    strokeWidth="4"
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
