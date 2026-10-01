<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { getEventGroupDisplayName } from '$lib/models/event-groups/get-group-name';
  import type { LazyGroup } from '$lib/services/grouped-event-buffer';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { resolveSystemNexusEvent } from '$lib/system-nexus-endpoints';
  import type { ValidTime } from '$lib/utilities/format-time';
  import { getEventClassificationLabel } from '$lib/utilities/get-status-label';

  import { dotColors } from '../colors';
  import { CategoryIcon } from '../constants';
  import { GUTTER, ROW_HEIGHT } from './constants';
  import { alignedDotBox } from './primitives';
  import { timelineTextPosition } from './timeline-positioning';

  type Props = {
    group: LazyGroup;
    timelineKey: string;
    canvasWidth: number;
    project: (time: ValidTime | undefined | null) => number;
    readOnly: boolean;
    showLabel?: boolean;
    /** Row height of the view this row sits in. */
    rowHeight?: number;
  };

  let {
    group,
    timelineKey,
    canvasWidth,
    project,
    readOnly,
    showLabel = true,
    rowHeight = ROW_HEIGHT,
  }: Props = $props();

  const presentation = $derived.by(() => {
    const pointX = Math.round(project(group.initialEvent.eventTime));
    const displayName =
      group.timelineDisplayName ??
      getEventGroupDisplayName(group.initialEvent as never);
    const effectiveCategory =
      group.timelineCategory ??
      resolveSystemNexusEvent(group.initialEvent)?.timelineCategory ??
      group.category;
    return {
      visible: pointX >= GUTTER && pointX <= canvasWidth - GUTTER,
      bounds: alignedDotBox(
        pointX,
        rowHeight / 2,
        effectiveCategory === 'signal' ? 'center' : 'start',
      ),
      displayName,
      accessibleName: translate('events.row-accessible-name', {
        eventType: displayName,
        classification: getEventClassificationLabel(
          group.finalClassification || group.classification,
        ),
      }),
      colors: dotColors(group.classification),
      icon: CategoryIcon[effectiveCategory].name,
      label: timelineTextPosition(
        [pointX],
        rowHeight / 2,
        canvasWidth - 2 * GUTTER,
        false,
      ),
    };
  });
</script>

{#if presentation.visible}
  <button
    type="button"
    class="event absolute inset-0 m-0 border-0 bg-transparent p-0 outline-none"
    aria-label={presentation.accessibleName}
    disabled={readOnly}
    onclick={() => setActiveGroup(group, timelineKey)}
  >
    <span
      class="absolute left-0 top-0 h-[var(--dot)] w-[var(--dot)] rounded-[var(--dot-r)] border-2 border-solid"
      style:transform="translate({presentation.bounds.left}px, {presentation
        .bounds.top}px)"
      style:border-color={presentation.colors.stroke}
      style:background={presentation.colors.fill}
    >
      <svg
        class="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 text-black"
        viewBox="0 0 16 16"
      >
        <use href="#ti-{presentation.icon}" />
      </svg>
    </span>
    <span
      class="absolute z-10 -translate-y-1/2 select-none whitespace-nowrap rounded-full bg-[rgb(var(--color-surface-primary))] px-1.5 text-xs leading-none"
      class:hidden={!showLabel}
      class:-translate-x-full={presentation.label.textAnchor === 'end'}
      style:left="{presentation.label.textPosition[0]}px"
      style:top="{rowHeight / 2}px">{presentation.displayName}</span
    >
  </button>
{/if}

<style lang="postcss">
  .event {
    pointer-events: auto;
    cursor: pointer;
  }

  .event:disabled {
    cursor: default;
  }

  .event:not(:disabled):focus-visible {
    @apply ring-2 ring-primary;
  }
</style>
