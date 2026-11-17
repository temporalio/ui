<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import { translate } from '$lib/i18n/translate';
  import { hourFormat, timeFormat } from '$lib/stores/time-format';

  import {
    buildRulerTicks,
    DAY_MS,
    formatClockTime,
    MINUTE_MS,
    type RulerSegment,
  } from './run-strip-layout';

  interface Props {
    segments: RulerSegment[];
    selectedIndex: number;
    live: boolean;
    nowX: number | undefined;
  }

  let { segments, selectedIndex, live, nowX }: Props = $props();

  const FIRST_LABEL_WIDTH = 128;
  const RUN_LABEL_WIDTH = 80;
  const MAJOR_LABEL_HALF_WIDTH = 38;
  const DATED_MAJOR_LABEL_HALF_WIDTH = 56;
  const NOW_WIDTH = 48;
  const PILL_WIDTH = 92;
  const MARKER_GAP = 4;

  const ticks = $derived(buildRulerTicks(segments));
  const selectedSegment = $derived(segments[selectedIndex]);
  const pinnedX = $derived(live ? undefined : selectedSegment?.x);
  const firstSegment = $derived(segments[0]);

  const formatTickLabel = (
    time: number,
    { seconds, date = false }: { seconds: boolean; date?: boolean },
  ) =>
    formatClockTime(time, {
      timeFormat: $timeFormat,
      hourFormat: $hourFormat,
      seconds,
      date,
    });

  const overlapsReservedLabel = (
    { from, to }: { from: number; to: number },
    { ignoreFirstRunLabel = false }: { ignoreFirstRunLabel?: boolean } = {},
  ) => {
    if (
      !ignoreFirstRunLabel &&
      firstSegment &&
      from < firstSegment.x + FIRST_LABEL_WIDTH &&
      to > firstSegment.x
    ) {
      return true;
    }
    if (
      nowX !== undefined &&
      to > nowX - NOW_WIDTH &&
      from < nowX + MARKER_GAP
    ) {
      return true;
    }
    return (
      pinnedX !== undefined &&
      to > pinnedX - MARKER_GAP &&
      from < pinnedX + PILL_WIDTH
    );
  };

  const labels = $derived(
    ticks.flatMap((tick) => {
      if (!tick.labelled) {
        return [];
      }
      const isFirst = tick.kind === 'run' && tick.x === firstSegment?.x;
      const seconds = tick.step < MINUTE_MS;
      const daily = tick.step >= DAY_MS;
      const majorLabelHalfWidth = daily
        ? DATED_MAJOR_LABEL_HALF_WIDTH
        : MAJOR_LABEL_HALF_WIDTH;
      if (tick.kind === 'run') {
        const width = isFirst || daily ? FIRST_LABEL_WIDTH : RUN_LABEL_WIDTH;
        if (
          overlapsReservedLabel(
            { from: tick.x, to: tick.x + width },
            { ignoreFirstRunLabel: isFirst },
          )
        ) {
          return [];
        }
        return [
          {
            tick,
            text: formatTickLabel(tick.time, {
              seconds,
              date: isFirst || daily,
            }),
          },
        ];
      }
      if (
        overlapsReservedLabel({
          from: tick.x - majorLabelHalfWidth,
          to: tick.x + majorLabelHalfWidth,
        })
      ) {
        return [];
      }
      return [
        { tick, text: formatTickLabel(tick.time, { seconds, date: daily }) },
      ];
    }),
  );
</script>

<div class="relative h-[34px]" aria-hidden="true" data-testid="run-ruler">
  {#if selectedSegment}
    <span
      class="absolute left-0 top-0 h-1 rounded-b-full bg-surface-overlay-brand transition-[translate,width] duration-500 motion-reduce:transition-none"
      style:translate="{selectedSegment.x}px 0"
      style:width="{Math.max(2, selectedSegment.width)}px"
      data-testid="run-ruler-band"
    ></span>
  {/if}
  {#each ticks as tick (`${tick.segmentId}-${tick.kind}-${tick.time}`)}
    <span
      class={twMerge(
        'absolute left-0 top-0 w-0 border-l border-secondary',
        tick.kind === 'run' && 'h-3.5 border-tertiary',
        tick.kind === 'major' && 'h-2.5',
        tick.kind === 'minor' && 'h-1.5',
      )}
      style:translate="{tick.x}px 0"
    ></span>
  {/each}
  {#each labels as { tick, text } (`${tick.segmentId}-${tick.kind}-${tick.time}`)}
    <span
      class={twMerge(
        'absolute left-0 top-4 whitespace-nowrap font-mono text-[11px] tabular-nums leading-none text-tertiary transition-colors',
        tick.kind === 'run' &&
          'pl-1 font-medium group-hover/strip:text-primary',
        tick.kind === 'major' &&
          '-translate-x-1/2 group-hover/strip:text-secondary',
      )}
      style:translate="{tick.x}px 0">{text}</span
    >
  {/each}
  {#if nowX !== undefined}
    {#if live}
      <span
        class="absolute left-0 top-3 -translate-x-full whitespace-nowrap rounded-full bg-interactive-primary px-2 py-0.5 text-[10px] font-medium uppercase leading-none tracking-wide text-white transition-[translate] motion-reduce:transition-none"
        style:translate="{nowX}px 0"
        data-testid="run-ruler-now">{translate('workflows.now')}</span
      >
    {:else}
      <span
        class="absolute left-0 top-4 -translate-x-full pr-1 text-[10px] font-semibold uppercase leading-none tracking-wide text-tertiary group-hover/strip:text-primary"
        style:translate="{nowX}px 0">{translate('workflows.now')}</span
      >
    {/if}
  {/if}
  {#if pinnedX !== undefined && selectedSegment}
    <span
      class="absolute left-0 top-3 whitespace-nowrap rounded-full bg-interactive-primary px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums leading-none text-white"
      style:translate="{pinnedX}px 0"
      title={$timestamp(new Date(selectedSegment.startMs))}
      data-testid="run-ruler-pinned"
      >{formatTickLabel(selectedSegment.startMs, { seconds: true })}</span
    >
  {/if}
</div>
