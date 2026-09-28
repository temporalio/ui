<script lang="ts" generics="T extends TimelineReviewGroup">
  import { translate } from '$lib/i18n/translate';
  import { IconChevronDown, IconChevronRight } from '$lib/io/icon';
  import type { ValidTime } from '$lib/utilities/format-time';

  import { GUTTER, ROW_HEIGHT } from './constants';
  import type {
    TimelineHiddenRun,
    TimelineReviewGroup,
  } from './timeline-review-rows';

  type Props = {
    run: TimelineHiddenRun<T>;
    canvasWidth: number;
    project: (time: ValidTime | undefined | null) => number;
    onToggle: (key: string) => void;
  };

  let { run, canvasWidth, project, onToggle }: Props = $props();

  const MARKER_HEIGHT = 2;
  const MIN_MARKER_WIDTH = 4;

  const label = $derived(
    translate(
      run.open ? 'events.hidden-run-shown' : 'events.hidden-run-hidden',
      { count: run.count, first: run.firstId, last: run.lastId },
    ),
  );

  const marker = $derived.by(() => {
    const left = project(run.startTime as ValidTime);
    const right = project(run.endTime as ValidTime);
    const start = Math.max(GUTTER, Math.min(left, right));
    const end = Math.min(canvasWidth - GUTTER, Math.max(left, right));
    return { left: start, width: Math.max(MIN_MARKER_WIDTH, end - start) };
  });
</script>

<div
  class="absolute inset-0"
  data-testid="timeline-hidden-run-row"
  data-run-key={run.key}
>
  <div
    class="absolute rounded-full bg-content-tertiary"
    data-testid="timeline-hidden-run-marker"
    style:left="{marker.left}px"
    style:width="{marker.width}px"
    style:top="{(ROW_HEIGHT - MARKER_HEIGHT) / 2}px"
    style:height="{MARKER_HEIGHT}px"
  ></div>
  <button
    type="button"
    class="pointer-events-auto absolute top-1/2 flex h-5 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-primary bg-surface-secondary px-2 text-xs leading-none text-secondary hover:bg-interactive-secondary-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
    style:left="{GUTTER + 8}px"
    aria-expanded={run.open}
    onclick={() => onToggle(run.key)}
  >
    {#if run.open}
      <IconChevronDown width="1em" height="1em" />
    {:else}
      <IconChevronRight width="1em" height="1em" />
    {/if}
    <span>{label}</span>
  </button>
</div>
