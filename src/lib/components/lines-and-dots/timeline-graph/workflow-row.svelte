<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-status-label';

  import { GUTTER, ROW_HEIGHT } from './constants';
  import { dotBox, lineBox } from './primitives';
  import { timelineIconImage } from './timeline-icon-images';
  import { dotColors, strokeColor } from '../colors';

  interface Props {
    workflow: WorkflowExecution;
    length: number;
    y: number;
  }

  let { workflow, length, y }: Props = $props();

  const centerY = ROW_HEIGHT / 2;

  const start = GUTTER;
  const end = $derived(start + length - 2 * GUTTER);
  const lineBounds = $derived(lineBox([start, centerY], [end, centerY]));
  const color = $derived(
    strokeColor({
      status: workflow.status,
      delayed: isWorkflowDelayed(workflow),
    }),
  );
  const colors = $derived(dotColors(workflow.status));

  const accessibleName = $derived(
    translate('workflows.row-accessible-name', {
      workflowId: workflow.id,
      status: getWorkflowStatusLabel(workflow.status),
    }),
  );
</script>

<!-- Informational bar, not interactive → role="img"; pointer-events-none keeps
     the collapse toggles below clickable. -->
<div
  role="img"
  aria-label={accessibleName}
  class="pointer-events-none absolute inset-x-0 outline-none"
  style:top="{y - centerY}px"
  style:height="{ROW_HEIGHT}px"
>
  <div
    class="tl-line absolute"
    class:tl-line--dashed={workflow.isRunning}
    class:tl-line--animate={workflow.isRunning}
    style:left="{lineBounds.left}px"
    style:top="{lineBounds.top}px"
    style:width="{lineBounds.width}px"
    style:height="{lineBounds.height}px"
    style:--tl-line-color={color}
  ></div>
  {#each [start, end] as pointX (pointX)}
    {@const dotBounds = dotBox(pointX, centerY)}
    <div
      class="absolute h-[var(--dot)] w-[var(--dot)] rounded-[var(--dot-r)] border-2 border-solid"
      style:left="{dotBounds.left}px"
      style:top="{dotBounds.top}px"
      style:border-color={colors.stroke}
      style:background={colors.fill}
    >
      <span
        class="tl-icon-image absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2"
        style:--tl-icon-image={timelineIconImage.workflow}
      ></span>
    </div>
  {/each}
</div>

<style lang="postcss">
  .tl-icon-image {
    display: inline-block;
    background-image: var(--tl-icon-image);
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }
</style>
