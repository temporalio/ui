<script lang="ts">
  import {
    DEFAULT_STROKE_COLOR,
    getCategoryStrokeColor,
    getStatusStrokeColor,
  } from '$lib/components/lines-and-dots/constants';
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';
  import type { WorkflowStatus } from '$lib/types/workflows';

  type Props = {
    startPoint?: [number, number];
    endPoint?: [number, number];
    status?: WorkflowStatus | 'none';
    category?: EventTypeCategory | 'pending' | 'retry';
    classification?: EventClassification;
    scheduling?: boolean;
    pending?: boolean;
    paused?: boolean;
    retried?: boolean;
    strokeWidth?: number;
    strokeDasharray?: string;
    delayed?: boolean;
  };

  let {
    startPoint = [0, 1000],
    endPoint = [0, 1000],
    status = undefined,
    category = undefined,
    classification = undefined,
    scheduling = false,
    pending = false,
    paused = false,
    retried = false,
    strokeWidth = 2,
    strokeDasharray = 'none',
    delayed = false,
  }: Props = $props();

  const [x1, y1] = $derived(startPoint);
  const [x2, y2] = $derived(endPoint);
  const completedWithRetries = $derived(
    retried && classification === 'Completed',
  );

  const strokeColor = $derived.by(() => {
    let color = DEFAULT_STROKE_COLOR;
    if (status) {
      color = status === 'none' ? '#141414' : getStatusStrokeColor(status);
    }
    if (category) {
      const categoryColor = getCategoryStrokeColor(category);
      if (categoryColor !== DEFAULT_STROKE_COLOR) color = categoryColor;
    }
    if (classification) {
      const statusColor = getStatusStrokeColor(classification);
      if (statusColor !== DEFAULT_STROKE_COLOR) color = statusColor;
    }
    if (delayed && [classification, status].includes('Running')) {
      color = getStatusStrokeColor('Delayed');
    }
    if (category && ['pending', 'retry'].includes(category)) {
      // these categories take precedence over classification
      color = getCategoryStrokeColor(category);
    }

    return color;
  });
</script>

{#if completedWithRetries}
  <foreignObject
    x={x1}
    y={y1 - strokeWidth / 2}
    width={x2 - x1}
    height={strokeWidth}
  >
    <div
      class="h-full w-full"
      style="background: linear-gradient(255deg, {getStatusStrokeColor(
        'Completed',
      )} 0%, #F55 100%);"
    ></div>
  </foreignObject>
{:else}
  <line
    class="line"
    stroke={strokeColor}
    class:none={status === 'none'}
    class:scheduling
    class:animate-line={pending && !paused}
    stroke-width={strokeWidth}
    stroke-dasharray={pending ? '3' : strokeDasharray}
    x1={Math.max(0, x1)}
    x2={Math.max(0, x2)}
    {y1}
    {y2}
  />
{/if}

<style lang="postcss">
  .line {
    cursor: pointer;
    opacity: 1;
    outline: none;
  }

  .none {
    opacity: 0.65;
  }

  .scheduling {
    opacity: 0.35;
  }

  .animate-line {
    stroke-dashoffset: 0;
    animation: dash 60s linear infinite;
  }

  @keyframes dash {
    from {
      stroke-dashoffset: 200;
    }

    to {
      stroke-dashoffset: 0;
    }
  }
</style>
