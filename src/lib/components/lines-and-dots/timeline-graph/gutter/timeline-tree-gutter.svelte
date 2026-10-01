<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';

  import {
    IconChevronRight,
    type IconComponent,
    IconTemporalActivity,
    IconTemporalChildWorkflow,
    IconTemporalNexus,
    IconTemporalTimer,
  } from '$lib/io/icon';
  import { colorScales } from '$lib/theme/io/themes';
  import type { EventTypeCategory } from '$lib/types/events';

  import { getCategoryFillColor } from '../../colors';
  import { CategoryIcon } from '../../constants';
  import { ROW_HEIGHT } from '../constants';
  import {
    gutterSubtreeRange,
    gutterTreeLines,
    type TimelineGutterCell,
  } from './timeline-gutter-cells';

  type Slot = {
    cell: TimelineGutterCell;
    topPx: number;
    visible: boolean;
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
  };

  const {
    slots,
    widthPx,
    heightPx,
    onToggle,
    onToggleRun,
    onHoverBand,
    rowHeight = ROW_HEIGHT,
  }: Props = $props();

  const ROW_PAD_PX = 4;
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
  /** Keeps the elbow off the marker it points at rather than butting into it. */
  const ELBOW_GAP_PX = 2;
  /** Every elbow spans the same run: parent's rail to the row's content. */
  const ELBOW_PX = contentX(1) - railX(0) - ELBOW_GAP_PX;

  const depths = $derived(slots.map((s) => s.cell.depth));
  const treeLines = $derived(gutterTreeLines(depths));

  // Hovering a workflow highlights it together with everything nested under
  // it, so the band reads as "this workflow and its work".
  let hoveredIndex = $state<number | null>(null);
  const hoveredRange = $derived(
    hoveredIndex === null ? null : gutterSubtreeRange(depths, hoveredIndex),
  );
  const inHoveredSubtree = (index: number) =>
    Boolean(
      hoveredRange && index >= hoveredRange.start && index < hoveredRange.end,
    );

  // Report the band in canvas coordinates so the plot can extend it; the
  // subtree may run past the mounted window, so clamp to what is rendered.
  $effect(() => {
    if (!hoveredRange || !slots.length) {
      onHoverBand?.(null);
      return;
    }
    const first = slots[hoveredRange.start];
    const last = slots[Math.min(hoveredRange.end, slots.length) - 1];
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
    if (hoveredIndex === null || !hoveredRange) return null;
    const row = slots[hoveredIndex];
    if (!row) return null;

    const depth = row.cell.depth;
    const end = Math.min(hoveredRange.end, slots.length);
    let lastChild = -1;
    for (let i = hoveredRange.start + 1; i < end; i += 1) {
      if (slots[i].cell.depth === depth + 1) lastChild = i;
    }
    if (lastChild < 0) return null;

    return { level: depth, startIndex: hoveredIndex + 1, endIndex: lastChild };
  });

  // The spine already exists as the children's own rails, so the hover just
  // recolours them rather than painting a second line over the top.
  const isActiveRail = (index: number, level: number) =>
    activeSpine !== null &&
    level === activeSpine.level &&
    index >= activeSpine.startIndex &&
    index <= activeSpine.endIndex;

  const markColor = (cell: TimelineGutterCell) =>
    cell.category ? getCategoryFillColor(cell.category) : NEUTRAL_MARK_COLOR;

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
  const TREE_ICONS: Partial<Record<EventTypeCategory, TreeIcon>> = {
    activity: { Icon: IconTemporalActivity, title: 'Activity' },
    'child-workflow': {
      Icon: IconTemporalChildWorkflow,
      title: 'Child Workflow',
    },
    timer: { Icon: IconTemporalTimer, title: 'Timer' },
    nexus: { Icon: IconTemporalNexus, title: 'Nexus' },
  };

  const iconFor = (cell: TimelineGutterCell): TreeIcon | undefined =>
    cell.category
      ? (TREE_ICONS[cell.category] ?? CategoryIcon[cell.category])
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
      ? (knownChildCounts.get(slot.cell.key) ?? 0)
      : (lines?.childCount ?? 0)}
    <div
      class="group/row absolute left-0 right-0 flex items-center pr-2 text-sm"
      style:gap="{MARKER_GAP_PX}px"
      class:bg-interactive-secondary-hover={inHoveredSubtree(index)}
      class:opacity-50={hoveredRange !== null && !inHoveredSubtree(index)}
      role="presentation"
      onpointerenter={() => (hoveredIndex = index)}
      onpointerleave={() => {
        if (hoveredIndex === index) hoveredIndex = null;
      }}
      style:height="{rowHeight}px"
      style:transform="translateY({slot.topPx}px)"
      style:padding-left="{contentX(slot.cell.depth)}px"
      style:display={slot.visible ? 'flex' : 'none'}
      data-testid="timeline-gutter-cell"
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
        <span
          class="tree-rail pointer-events-none absolute top-0"
          class:tree-rail-active={active}
          data-testid={active ? 'timeline-tree-active-rail' : undefined}
          style:left="{railX(lines.elbowLevel)}px"
          style:height={lines.lastChild ? '50%' : '100%'}
        ></span>
        <span
          class="tree-elbow pointer-events-none absolute top-1/2"
          class:tree-elbow-active={active}
          style:left="{railX(lines.elbowLevel)}px"
          style:width="{ELBOW_PX}px"
        ></span>
      {/if}

      {#if toggleKey}
        <button
          type="button"
          class="group/toggle relative z-10 flex min-w-0 flex-1 items-center text-left"
          style:gap="{MARKER_GAP_PX}px"
          aria-expanded={slot.cell.expanded}
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
      {:else}
        <span
          class="flex min-w-0 flex-1 items-center"
          style:gap="{MARKER_GAP_PX}px"
        >
          {@render rowBody(slot.cell, icon, color, collapsed, badgeCount)}
        </span>
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
      <span
        class="absolute left-1/2 top-0 flex items-center justify-center rounded-full px-0.5 text-[11px] font-semibold tabular-nums leading-none"
        style:height="{MARKER_PX}px"
        style:min-width="{MARKER_PX}px"
        style:transform="translateX(-50%)"
        style:color
        style:background="color-mix(in srgb, {color} 16%, transparent)"
      >
        {#if badgeCount}
          <span
            class={collapsible
              ? 'transition-opacity duration-150 ease-out group-hover/row:opacity-0 group-focus-visible/toggle:opacity-0 motion-reduce:transition-none'
              : undefined}
          >
            {badgeCount}
          </span>
        {/if}
        {#if collapsible}
          <!-- With a count to show, the chevron sits on top of it and fades in
               on hover, so the badge never changes size. The arrow turns rather
               than swapping glyphs, so expanding reads as one control moving. -->
          <span
            class="flex size-2.5 items-center transition duration-150 ease-out motion-reduce:transition-none {badgeCount
              ? 'absolute inset-0 m-auto scale-75 opacity-0 group-hover/row:scale-100 group-hover/row:opacity-100 group-focus-visible/toggle:scale-100 group-focus-visible/toggle:opacity-100'
              : ''} {collapsed ? '' : 'rotate-90'}"
          >
            <IconChevronRight class="size-2.5" />
          </span>
        {/if}
      </span>
    </span>
  {/if}

  {#if icon}
    <span class="flex size-5 shrink-0 items-center" style:color>
      <icon.Icon class="size-5" title={icon.title} />
    </span>
  {/if}

  {#if cell.detail}
    <!-- Name over identifier, 4px apart. The lines sit on tight boxes so the
         pair fits the row; each box is padded and pulled back by the same
         amount so its descenders show without moving anything. -->
    <span class="flex min-w-0 flex-1 flex-col justify-center gap-1">
      <span
        class="-mb-0.5 truncate pb-0.5 leading-none"
        class:text-secondary={cell.kind === 'run'}
        class:font-medium={isWorkflowLabel(cell)}
        style:color={isWorkflowLabel(cell) ? color : undefined}
      >
        {cell.label}
      </span>
      <span class="-mb-0.5 truncate pb-0.5 text-xs leading-none text-secondary">
        {cell.detail}
      </span>
    </span>
  {:else}
    <span
      class="truncate"
      class:text-secondary={cell.kind === 'run'}
      class:font-medium={isWorkflowLabel(cell)}
      style:color={isWorkflowLabel(cell) ? color : undefined}
    >
      {cell.label}
    </span>
  {/if}
{/snippet}

<style lang="postcss">
  /* Connectors are drawn per row rather than as one line behind them, so a
     virtualized row carries its own segments and needs no continuous layer. */
  .tree-rail {
    width: 1px;
    background: var(--color-border-primary);
  }

  .tree-elbow {
    height: 1px;
    background: var(--color-border-primary);
  }

  /* The same rails, recoloured while their group is hovered. */
  .tree-rail-active,
  .tree-elbow-active {
    background: var(--color-border-brand);
  }
</style>
