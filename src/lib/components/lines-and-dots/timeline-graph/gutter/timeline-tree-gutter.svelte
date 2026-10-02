<script lang="ts">
  import type { Attachment } from 'svelte/attachments';
  import { SvelteMap } from 'svelte/reactivity';

  import { translate } from '$lib/i18n/translate';
  import {
    IconCanceled,
    IconCheckCircleSolid,
    IconChevronRight,
    type IconComponent,
    IconExclamationOctagon,
    IconTemporalTaskQueue,
    IconXmarkCircleSolid,
  } from '$lib/io/icon';
  import { colorScales } from '$lib/theme/io/themes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getEventClassificationLabel } from '$lib/utilities/get-event-classification-label';

  import { getCategoryFillColor } from '../../colors';
  import { CategoryIcon } from '../../constants';
  import {
    LANE_DURATION_COLUMN_PX,
    LANE_RETRIES_COLUMN_PX,
    LANE_TREE_COLUMN_GAP_PX,
    LANE_TREE_ROW_PAD_PX,
    ROW_HEIGHT,
  } from '../constants';
  import {
    gutterSubtreeRange,
    gutterTreeLines,
    type TimelineGutterCell,
    type TimelineGutterReveal,
  } from './timeline-gutter-cells';

  import TimelineTreeHoverCard from './timeline-tree-hover-card.svelte';

  type Slot = {
    cell: TimelineGutterCell;
    topPx: number;
    visible: boolean;
    /** The row's place in the whole timeline, so stripes hold while scrolling. */
    rowIndex: number;
    /** Identifies which scope and run the row sits in, for the plot's use. */
    workflowKey?: string;
    runKey?: string;
  };

  export type TimelineGutterHoverBand = {
    topPx: number;
    heightPx: number;
    /** The scope and run the hovered row belongs to. */
    workflowKey?: string;
    runKey?: string;
    /** The band marks the open selection rather than a hover. */
    selection?: boolean;
  };

  type Props = {
    slots: Slot[];
    widthPx: number;
    heightPx: number;
    onToggle: (edgeKey: string) => void;
    /** Run rows fold by run key rather than by child edge. */
    onToggleRun: (runKey: string) => void;
    /** Lets the canvas carry the hover band across the plot area too. */
    onHoverBand?: (band: TimelineGutterHoverBand | null) => void;
    /** Row height of the view, so tree rows line up with the plot's. */
    rowHeight?: number;
    /** Opens an event row in the details panel; unset, rows don't offer it. */
    onShowDetails?: (detailsKey: string) => void;
    /** The event shown in the details panel, so its row stays marked. */
    selectedDetailsKey?: string;
    /** The live clock, for the durations of work still running. */
    nowMs?: number;
  };

  const {
    slots,
    widthPx,
    heightPx,
    onToggle,
    onToggleRun,
    onHoverBand,
    rowHeight = ROW_HEIGHT,
    onShowDetails,
    selectedDetailsKey,
    nowMs = Date.now(),
  }: Props = $props();

  const ROW_PAD_PX = LANE_TREE_ROW_PAD_PX;
  /** Marker (badge or chevron) and the gap after it. */
  const MARKER_PX = 20;
  /**
   * Space between the marker, the icon and the label. It also sets the indent
   * below, so it is applied from here rather than from a utility class.
   */
  const MARKER_GAP_PX = 8;
  /**
   * One level steps by exactly the marker slot, so a row's content starts in
   * its parent's icon column: a child's badge, or a leaf's icon, lands under
   * the icon of the workflow it belongs to.
   */
  const INDENT_PX = MARKER_PX + MARKER_GAP_PX;
  /** Centres the rail on the marker its children hang from. */
  const RAIL_OFFSET_PX = ROW_PAD_PX + MARKER_PX / 2;
  const NEUTRAL_MARK_COLOR = colorScales.slate[8];

  const railX = (level: number) => level * INDENT_PX + RAIL_OFFSET_PX;
  const contentX = (depth: number) => depth * INDENT_PX + ROW_PAD_PX;
  /**
   * Keeps the elbow well short of the marker it points at, so the branch reads
   * as a short tick off the spine rather than a line running into the row.
   */
  const ELBOW_GAP_PX = 10;
  /** Every elbow spans the same run: parent's rail to the row's content. */
  const ELBOW_PX = contentX(1) - railX(0) - ELBOW_GAP_PX;
  /** How far the branch curves as it leaves the spine. */
  const ELBOW_RADIUS_PX = 6;

  /**
   * A row's branch, drawn as one path with the spine it leaves: the lines are
   * translucent, so a separate curve over the spine would show darker where
   * the two overlap. Half-pixel offsets keep the 1px stroke crisp.
   */
  const elbowPath = (level: number, lastChild: boolean): string => {
    const x = railX(level) + 0.5;
    const midY = Math.floor(rowHeight / 2) + 0.5;
    const curveTopY = midY - ELBOW_RADIUS_PX;
    const branch = `M ${x} ${curveTopY} A ${ELBOW_RADIUS_PX} ${ELBOW_RADIUS_PX} 0 0 0 ${
      x + ELBOW_RADIUS_PX
    } ${midY} H ${x + ELBOW_PX}`;
    const spine = lastChild
      ? `M ${x} 0 V ${curveTopY}`
      : `M ${x} 0 V ${rowHeight}`;
    return `${spine} ${branch}`;
  };

  const depths = $derived(slots.map((s) => s.cell.depth));
  const treeLines = $derived(gutterTreeLines(depths));

  // Hovering a workflow highlights it together with everything nested under
  // it, so the band reads as "this workflow and its work".
  let hoveredIndex = $state<number | null>(null);
  const hoveredRange = $derived(
    hoveredIndex === null ? null : gutterSubtreeRange(depths, hoveredIndex),
  );

  // The row open in the details panel keeps its subtree marked the same way
  // while nothing is hovered.
  const selectedIndex = $derived.by(() => {
    if (!selectedDetailsKey || !onShowDetails) return null;
    const index = slots.findIndex(
      (slot) => slot.cell.detailsKey === selectedDetailsKey,
    );
    return index < 0 ? null : index;
  });
  const focusIndex = $derived(hoveredIndex ?? selectedIndex);
  const focusRange = $derived(
    focusIndex === null ? null : gutterSubtreeRange(depths, focusIndex),
  );
  const inFocusSubtree = (index: number) =>
    Boolean(focusRange && index >= focusRange.start && index < focusRange.end);

  // Report the band in canvas coordinates so the plot can extend it; the
  // subtree may run past the mounted window, so clamp to what is rendered.
  $effect(() => {
    if (!focusRange || !slots.length) {
      onHoverBand?.(null);
      return;
    }
    const first = slots[focusRange.start];
    const last = slots[Math.min(focusRange.end, slots.length) - 1];
    if (!first || !last) {
      onHoverBand?.(null);
      return;
    }
    onHoverBand?.({
      topPx: first.topPx,
      heightPx: last.topPx + rowHeight - first.topPx,
      // The hovered row itself, not its subtree, names the containers: the
      // plot can then draw them even when the groups are switched off.
      workflowKey: first.workflowKey,
      runKey: first.runKey,
      selection: hoveredIndex === null || undefined,
    });
  });

  // Collapsing drops the descendants from the row list, so the count can no
  // longer be derived from it. Remember what each row had while it was open.
  const knownChildCounts = new SvelteMap<string, number>();

  $effect(() => {
    slots.forEach((slot, index) => {
      const count = treeLines[index]?.childCount ?? 0;
      if (count > 0) knownChildCounts.set(slot.cell.key, count);
    });
  });

  /**
   * The hovered group's own spine: the rail its children hang from, running
   * from the group's row down to its last direct child. Drawn as its own
   * overlay so it is exact regardless of which guides a given row carries.
   */
  const activeSpine = $derived.by(() => {
    if (focusIndex === null || !focusRange) return null;
    const row = slots[focusIndex];
    if (!row) return null;

    const depth = row.cell.depth;
    const end = Math.min(focusRange.end, slots.length);
    let lastChild = -1;
    for (let i = focusRange.start + 1; i < end; i += 1) {
      if (slots[i].cell.depth === depth + 1) lastChild = i;
    }
    if (lastChild < 0) return null;

    return { level: depth, startIndex: focusIndex + 1, endIndex: lastChild };
  });

  // The spine already exists as the children's own rails, so the hover just
  // recolours them rather than painting a second line over the top.
  const isActiveRail = (index: number, level: number) =>
    activeSpine !== null &&
    level === activeSpine.level &&
    index >= activeSpine.startIndex &&
    index <= activeSpine.endIndex;

  const markColor = (cell: TimelineGutterCell) =>
    cell.waiting
      ? getCategoryFillColor('pending')
      : cell.category
        ? getCategoryFillColor(cell.category)
        : NEUTRAL_MARK_COLOR;

  /**
   * Workflow rows carry their category colour into the label as well as the
   * icon, and a heavier weight, so the workflows stand out from the work
   * inside them when scanning. Activities and runs keep the default text.
   */
  const isWorkflowLabel = (cell: TimelineGutterCell) =>
    cell.category === 'workflow' || cell.category === 'child-workflow';

  type TreeIcon = { Icon: IconComponent; title: string };

  /**
   * The tree names its rows with the design system's own Temporal glyphs.
   * Only the categories it overrides are listed; anything else keeps the
   * shared icon, so a row still reads the same as it does elsewhere.
   */
  /**
   * The tree can be narrowed until labels are cut off, so a cut-off label
   * offers its full text on hover. Checked on entry, since whether it fits
   * changes with the tree's width.
   */
  const titleWhenTruncated: Attachment<HTMLElement> = (element) => {
    const update = () => {
      if (element.scrollWidth > element.clientWidth) {
        element.title = element.textContent?.trim() ?? '';
      } else {
        element.removeAttribute('title');
      }
    };
    element.addEventListener('pointerenter', update);
    return () => element.removeEventListener('pointerenter', update);
  };

  /**
   * The icon's slot stays as wide as the marker so a child still hangs under
   * its parent's icon; the glyph is smaller and centred in it.
   */
  const ICON_PX = 20;

  /** Where a row's text starts, so its hover card can sit right on it. */
  const labelStartX = (depth: number, hasMarker: boolean, hasIcon: boolean) =>
    contentX(depth) +
    (hasMarker ? MARKER_PX + MARKER_GAP_PX : 0) +
    (hasIcon ? ICON_PX + MARKER_GAP_PX : 0);

  // A workflow type reads as one on sight; a bare uuid needs naming.
  const REVEAL_TITLES: Record<
    TimelineGutterReveal['kind'],
    string | undefined
  > = {
    'run-id': translate('common.run-id'),
    'workflow-id': undefined,
  };
  const hoverCardId = (key: string) => `timeline-tree-hover-card-${key}`;

  // Only running work reads the clock, so finished rows don't re-render on
  // every tick.
  const durationText = (cell: TimelineGutterCell): string => {
    if (!cell.timing) return '';
    const end = cell.timing.endTimeMs ?? nowMs;
    return (
      formatDistanceAbbreviated({
        start: new Date(cell.timing.startTimeMs),
        end: new Date(Math.max(end, cell.timing.startTimeMs)),
        includeMillisecondsForUnderSecond: true,
      }) || '0ms'
    );
  };

  const iconFor = (cell: TimelineGutterCell): TreeIcon | undefined =>
    cell.waiting
      ? { Icon: IconTemporalTaskQueue, title: 'Task queue' }
      : cell.category
        ? CategoryIcon[cell.category]
        : undefined;
</script>

<div
  class="relative shrink-0"
  style:width="{widthPx}px"
  style:height="{heightPx}px"
  data-testid="timeline-tree-gutter"
>
  {#each slots as slot, index (slot.cell.key)}
    {@const lines = treeLines[index]}
    {@const icon = iconFor(slot.cell)}
    {@const color = markColor(slot.cell)}
    {@const toggleKey = slot.cell.toggleEdgeKey ?? slot.cell.toggleRunKey}
    {@const collapsed = Boolean(toggleKey) && !slot.cell.expanded}
    {@const badgeCount = collapsed
      ? (slot.cell.childCount ?? knownChildCounts.get(slot.cell.key) ?? 0)
      : (lines?.childCount ?? 0)}
    {@const reveal = slot.cell.reveal}
    {@const hasMarker = Boolean(toggleKey) || badgeCount > 0}
    {@const detailsKey = onShowDetails ? slot.cell.detailsKey : undefined}
    {@const hasCard = Boolean(reveal) || Boolean(detailsKey)}
    {@const selected = Boolean(detailsKey) && detailsKey === selectedDetailsKey}
    <div
      class="group/row absolute left-0 right-0 flex items-center text-xs hover:z-[60] has-[:focus-visible]:z-[60]"
      style:gap="{MARKER_GAP_PX}px"
      class:bg-interactive-secondary-hover={inFocusSubtree(index) && !selected}
      class:bg-interactive-secondary-press={selected}
      class:tree-row-stripe={slot.rowIndex % 2 === 1 &&
        !inFocusSubtree(index) &&
        !selected}
      class:opacity-50={hoveredRange !== null && !inFocusSubtree(index)}
      role="presentation"
      onpointerenter={() => (hoveredIndex = index)}
      onpointerleave={() => {
        if (hoveredIndex === index) hoveredIndex = null;
      }}
      style:height="{rowHeight}px"
      style:padding-right="{LANE_TREE_COLUMN_GAP_PX}px"
      style:transform="translateY({slot.topPx}px)"
      style:padding-left="{contentX(slot.cell.depth)}px"
      style:display={slot.visible ? 'flex' : 'none'}
      data-testid="timeline-gutter-cell"
      data-gutter-key={slot.cell.key}
      data-selected={selected || undefined}
      data-kind={slot.cell.kind}
      data-depth={slot.cell.depth}
    >
      {#each lines?.guides ?? [] as level (level)}
        <span
          class="tree-rail pointer-events-none absolute inset-y-0"
          class:tree-rail-active={isActiveRail(index, level)}
          data-testid={isActiveRail(index, level)
            ? 'timeline-tree-active-rail'
            : undefined}
          style:left="{railX(level)}px"
        ></span>
      {/each}

      {#if lines?.elbowLevel !== null && lines?.elbowLevel !== undefined}
        {@const active = isActiveRail(index, lines.elbowLevel)}
        <svg
          class="tree-elbow pointer-events-none absolute inset-0 overflow-visible"
          class:tree-elbow-active={active}
          data-testid={active ? 'timeline-tree-active-rail' : undefined}
          width="100%"
          height={rowHeight}
          aria-hidden="true"
        >
          <path d={elbowPath(lines.elbowLevel, lines.lastChild)} fill="none" />
        </svg>
      {/if}

      {#if toggleKey}
        <button
          type="button"
          class="group/toggle relative z-10 flex min-w-0 flex-1 items-center text-left"
          style:gap="{MARKER_GAP_PX}px"
          aria-expanded={slot.cell.expanded}
          aria-describedby={hasCard ? hoverCardId(slot.cell.key) : undefined}
          aria-label="{slot.cell.expanded ? 'Collapse' : 'Expand'} {slot.cell
            .label}"
          title={badgeCount
            ? `${badgeCount} nested`
            : slot.cell.expanded
              ? 'Collapse'
              : 'Expand'}
          onclick={() =>
            slot.cell.toggleRunKey
              ? onToggleRun(slot.cell.toggleRunKey)
              : onToggle(toggleKey)}
        >
          {@render rowBody(slot.cell, icon, color, collapsed, badgeCount)}
        </button>
      {:else if detailsKey}
        <!-- An event row with nothing to fold opens its details instead, so
             the tree answers a click the same way the plot does. -->
        <button
          type="button"
          class="relative z-10 flex min-w-0 flex-1 items-center text-left"
          style:gap="{MARKER_GAP_PX}px"
          aria-describedby={hoverCardId(slot.cell.key)}
          aria-pressed={selected}
          onclick={() => onShowDetails?.(detailsKey)}
        >
          {@render rowBody(slot.cell, icon, color, collapsed, badgeCount)}
        </button>
      {:else}
        <span
          class="flex min-w-0 flex-1 items-center"
          style:gap="{MARKER_GAP_PX}px"
        >
          {@render rowBody(slot.cell, icon, color, collapsed, badgeCount)}
        </span>
      {/if}

      <span
        class="shrink-0 truncate text-right font-mono tabular-nums text-secondary"
        style:width="{LANE_DURATION_COLUMN_PX}px"
        data-testid="timeline-tree-duration"
      >
        {durationText(slot.cell)}
      </span>
      <span
        class="shrink-0 text-right font-mono tabular-nums text-secondary"
        style:width="{LANE_RETRIES_COLUMN_PX}px"
        title={slot.cell.attempt
          ? `${translate('workflows.attempt')} ${slot.cell.attempt}`
          : undefined}
        data-testid="timeline-tree-retries"
      >
        {slot.cell.attempt ? `${slot.cell.attempt}x` : ''}
      </span>

      {#if hasCard}
        <TimelineTreeHoverCard
          id={hoverCardId(slot.cell.key)}
          title={reveal ? REVEAL_TITLES[reveal.kind] : undefined}
          value={reveal?.value ?? slot.cell.label}
          copyable={Boolean(reveal)}
          onViewDetails={detailsKey
            ? () => onShowDetails?.(detailsKey)
            : undefined}
          labelStartPx={labelStartX(slot.cell.depth, hasMarker, Boolean(icon))}
        />
      {/if}
    </div>
  {/each}
</div>

{#snippet rowBody(
  cell: TimelineGutterCell,
  icon: TreeIcon | undefined,
  color: string,
  collapsed: boolean,
  badgeCount: number,
)}
  {@const collapsible = Boolean(cell.toggleEdgeKey ?? cell.toggleRunKey)}
  {#if collapsible || badgeCount}
    <!-- The slot is one marker wide and the badge holds one glyph at a time —
         the count, or the chevron while the row is hovered or focused — so it
         fits the slot and keeps a clear gap to the icon. It stays centred on
         the slot, which is where the rail runs. -->
    <span
      class="relative z-10 shrink-0"
      style:width="{MARKER_PX}px"
      style:height="{MARKER_PX}px"
    >
      <!-- On hover the count rolls up out of the pill and the chevron rolls in
           behind it, like a counter turning over; the pill clips both. Every
           part eases in and out on the same timing, including the chevron's
           turn when the row opens or closes. -->
      <span
        class="badge tree-ink absolute left-1/2 top-0 flex items-center justify-center overflow-hidden rounded-full px-0.5 text-[11px] font-semibold tabular-nums leading-none"
        class:badge-interactive={collapsible}
        style:height="{MARKER_PX}px"
        style:min-width="{MARKER_PX}px"
        style:transform="translateX(-50%)"
        style:--mark={color}
      >
        {#if badgeCount}
          <span class:badge-count={collapsible}>
            {badgeCount}
          </span>
        {/if}
        {#if collapsible}
          <span
            class="badge-chevron flex size-2.5 items-center"
            class:badge-chevron-swap={badgeCount > 0}
            class:rotate-90={!collapsed}
          >
            <IconChevronRight class="size-2.5" />
          </span>
        {/if}
      </span>
    </span>
  {/if}

  {#if icon}
    <span
      class="tree-ink flex size-5 shrink-0 items-center justify-center"
      style:--mark={color}
    >
      <icon.Icon class="size-4" title={icon.title} />
    </span>
  {/if}

  <span
    class="truncate"
    {@attach titleWhenTruncated}
    class:text-secondary={cell.kind === 'run'}
    class:font-medium={isWorkflowLabel(cell)}
    class:tree-ink={isWorkflowLabel(cell)}
    style:--mark={isWorkflowLabel(cell) ? color : undefined}
  >
    {cell.label}
  </span>
  {#if cell.completed}
    <IconCheckCircleSolid
      class="-ml-1 size-3.5 text-static-success"
      title={getEventClassificationLabel('Completed')}
      data-testid="timeline-tree-completed"
    />
  {:else if cell.outcome === 'Canceled'}
    <IconCanceled
      class="-ml-1 size-3.5"
      style="color: {colorScales.slate[9]}"
      title={getEventClassificationLabel('Canceled')}
      data-testid="timeline-tree-canceled"
    />
  {:else if cell.outcome === 'Terminated'}
    <IconExclamationOctagon
      class="-ml-1 size-3.5"
      style="color: {colorScales.amber[9]}"
      title={getEventClassificationLabel('Terminated')}
      data-testid="timeline-tree-terminated"
    />
  {:else if cell.outcome}
    <IconXmarkCircleSolid
      class="-ml-1 size-3.5 text-static-danger"
      title={getEventClassificationLabel(cell.outcome)}
      data-testid="timeline-tree-failed"
    />
  {/if}
{/snippet}

<style lang="postcss">
  .tree-row-stripe {
    background: color-mix(
      in srgb,
      var(--color-surface-overlay-primary) 60%,
      transparent
    );
  }

  /* On the dark page the same wash barely registers, so it takes the full
     overlay there. */
  :global([data-theme='dark']) .tree-row-stripe {
    background: var(--color-surface-overlay-primary);
  }

  /* Connectors are drawn per row rather than as one line behind them, so a
     virtualized row carries its own segments and needs no continuous layer. */
  .tree-rail {
    width: 1px;
    background: var(--color-border-primary);
  }

  .tree-elbow {
    stroke: var(--color-border-primary);
    stroke-width: 1px;
  }

  /* The same rails, recoloured while their group is hovered. */
  .tree-rail-active {
    background: var(--color-border-brand);
  }

  .tree-elbow-active {
    stroke: var(--color-border-brand);
  }

  /* The category colours are dark marker fills, readable on a light page
     only, so on a dark page the tree lifts them toward white for its text,
     icons and badges. */
  .tree-ink {
    --mark-ink: var(--mark);

    color: var(--mark-ink);
  }

  :global([data-theme='dark']) .tree-ink {
    --mark-ink: color-mix(in oklab, var(--mark) 45%, white);
  }

  .badge {
    background: color-mix(in srgb, var(--mark-ink) 16%, transparent);
    transition: background-color 200ms ease-in-out;
  }

  :global(.group\/row:hover) .badge-interactive,
  :global(.group\/toggle:focus-visible) .badge-interactive {
    background: color-mix(in srgb, var(--mark-ink) 26%, transparent);
  }

  .badge-count,
  .badge-chevron {
    transition:
      transform 200ms ease-in-out,
      opacity 200ms ease-in-out;
  }

  :global(.group\/row:hover) .badge-count,
  :global(.group\/toggle:focus-visible) .badge-count {
    transform: translateY(-12px);
    opacity: 0;
  }

  /* With a count showing, the chevron waits below the pill until hovered. */
  .badge-chevron-swap {
    position: absolute;
    inset: 0;
    margin: auto;
    opacity: 0;
    transform: translateY(12px);
  }

  .badge-chevron-swap.rotate-90 {
    transform: translateY(12px) rotate(90deg);
  }

  :global(.group\/row:hover) .badge-chevron-swap,
  :global(.group\/toggle:focus-visible) .badge-chevron-swap {
    opacity: 1;
    transform: translateY(0);
  }

  :global(.group\/row:hover) .badge-chevron-swap.rotate-90,
  :global(.group\/toggle:focus-visible) .badge-chevron-swap.rotate-90 {
    transform: rotate(90deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .badge,
    .badge-count,
    .badge-chevron {
      transition: none;
    }
  }
</style>
