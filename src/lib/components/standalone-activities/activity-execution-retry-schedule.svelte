<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { type StandaloneActivity } from '$lib/pages/standalone-activity.svelte';
  import { formatSecondsAbbreviated } from '$lib/utilities/format-time';
  import { fromSeconds } from '$lib/utilities/to-duration';

  import DetailListColumn from '../detail-list/detail-list-column.svelte';
  import DetailListLabel from '../detail-list/detail-list-label.svelte';
  import DetailListTextValue from '../detail-list/detail-list-text-value.svelte';
  import DetailList from '../detail-list/detail-list.svelte';

  interface Props {
    activity: StandaloneActivity;
  }

  let { activity }: Props = $props();

  let graphWidth = $state(500);
  let graphHeight = $state(240);
  const BAR_CHART_PADDING_LEFT = 48;
  const BAR_CHART_PADDING_BOTTOM = 48;
  const BAR_CHART_PADDING_TOP = 32;
  const BAR_CHART_PADDING_RIGHT = 0;

  const chartMaxY = $derived(activity.maximumInterval ?? 1);

  const chartInnerWidth = $derived(
    graphWidth - BAR_CHART_PADDING_LEFT - BAR_CHART_PADDING_RIGHT,
  );
  const chartInnerHeight = $derived(
    graphHeight - BAR_CHART_PADDING_BOTTOM - BAR_CHART_PADDING_TOP,
  );

  const barWidth = $derived(
    activity.schedule.length > 0
      ? chartInnerWidth / activity.schedule.length - 2
      : 20,
  );

  function barHeight(waitSeconds: number): number {
    if (chartMaxY === 0) return 0;
    return (waitSeconds / chartMaxY) * chartInnerHeight;
  }

  function barX(index: number): number {
    if (activity.schedule.length === 0) return 0;
    return (
      BAR_CHART_PADDING_LEFT +
      index * (chartInnerWidth / activity.schedule.length) +
      1
    );
  }

  function barY(waitSeconds: number): number {
    return BAR_CHART_PADDING_TOP + chartInnerHeight - barHeight(waitSeconds);
  }

  const yAxisLabels = $derived.by(() => {
    const steps = 4;
    const labels = [];
    for (let i = 0; i <= steps; i++) {
      const val = (chartMaxY / steps) * i;
      labels.push({
        val: formatSecondsAbbreviated(Math.round(val)),
        y:
          BAR_CHART_PADDING_TOP +
          chartInnerHeight -
          (val / chartMaxY) * chartInnerHeight,
      });
    }
    return labels;
  });
</script>

<Card class="flex flex-col gap-4 py-5">
  <div>
    <h5 class="text-xs font-semibold uppercase tracking-wide">
      Retry Schedule
    </h5>
    {#if !activity.maximumAttempts}
      <span class="text-xs text-secondary"
        >(only showing the first 50 attempts)</span
      >
    {/if}
  </div>
  <DetailList aria-label="Retry Policy" rowCount={2}>
    <DetailListColumn>
      <DetailListLabel>Initial Interval</DetailListLabel>
      <DetailListTextValue text={fromSeconds(activity.initialInterval)} />
      <DetailListLabel>Maximum Interval</DetailListLabel>
      <DetailListTextValue text={fromSeconds(activity.maximumInterval)} />
    </DetailListColumn>
    <DetailListColumn>
      <DetailListLabel>Backoff Coefficient</DetailListLabel>
      <DetailListTextValue text={String(activity.backoffCoefficient)} />
      <DetailListLabel>Maximum Attempts</DetailListLabel>
      <DetailListTextValue
        text={activity.maximumAttempts ? String(activity.maximumAttempts) : '-'}
      />
    </DetailListColumn>
  </DetailList>
  <div
    bind:clientWidth={graphWidth}
    bind:clientHeight={graphHeight}
    class="overflow-auto"
  >
    <svg
      width={graphWidth}
      height={graphHeight}
      viewBox="0 0 {graphWidth} {graphHeight}"
    >
      {#each yAxisLabels as label (label.val)}
        <line
          x1={BAR_CHART_PADDING_LEFT}
          y1={label.y}
          x2={graphWidth - BAR_CHART_PADDING_RIGHT}
          y2={label.y}
        />
        <text
          x={BAR_CHART_PADDING_LEFT - 4}
          y={label.y + 4}
          text-anchor="end"
          font-size="9"
          fill="currentColor"
          opacity="0.5">{label.val}</text
        >
      {/each}

      {#each activity.schedule as entry, i (entry.attempt)}
        {@const isCurrentAttempt = entry.attempt === activity.currentAttempt}

        <rect
          x={barX(i)}
          y={barY(entry.waitSeconds)}
          width={barWidth}
          height={barHeight(entry.waitSeconds)}
          class={isCurrentAttempt ? 'fill-brand' : 'fill-subtle'}
          rx="2"
        />

        {#if i % 2 === 0}
          <text
            x={barX(i) + barWidth / 2}
            y={graphHeight - BAR_CHART_PADDING_BOTTOM + 14}
            text-anchor="middle"
            font-size="9"
            fill="currentColor"
            opacity="0.6">{entry.attempt}</text
          >
        {/if}
      {/each}

      <text
        x={graphWidth / 2}
        y={graphHeight - 8}
        text-anchor="middle"
        fill="currentColor"
        opacity="0.6"
        font-size="10">attempt</text
      >
    </svg>
  </div>
  <div
    class="mt-auto flex items-center justify-between border-t border-subtle pt-2"
  >
    <div class=" flex flex-col gap-0.5">
      <span class="text-xs font-semibold uppercase tracking-wide">Started</span>
      <span class="text-sm text-secondary">
        <Timestamp dateTime={activity.scheduleTime} />
      </span>
    </div>
    <div class=" flex flex-col gap-0.5 text-right">
      <span class="text-xs font-semibold uppercase tracking-wide"
        >{activity.running ? 'Stops' : 'Stopped'}</span
      >
      <span class="text-sm text-secondary">
        {#if activity.running && activity.deadlineTime}
          <Timestamp dateTime={activity.deadlineTime} />
        {:else if !activity.running}
          <Timestamp dateTime={activity.closeTime} />
        {/if}
      </span>
    </div>
  </div>
</Card>
