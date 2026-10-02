<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { prefersReducedMotion } from 'svelte/motion';
  import { fly } from 'svelte/transition';

  import { page } from '$app/state';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import { translate } from '$lib/i18n/translate';
  import { activeGroups, clearActiveGroups } from '$lib/stores/active-events';
  import { getSharedFilterParams } from '$lib/utilities/event-filter-params';
  import { routeForTimeline } from '$lib/utilities/route-for';

  import type { TimelineSelectedDetails } from './types';

  import GroupDetailsHeader from './group-details-header.svelte';
  import TimelineTreeResizeHandle from './gutter/timeline-tree-resize-handle.svelte';
  import LaneFrameCorner from './lane-frame-corner.svelte';
  import TimelineChildSummarySection from './timeline-child-summary-section.svelte';

  type Props = {
    details: TimelineSelectedDetails;
    widthPx: number;
    minWidthPx: number;
    maxWidthPx: number;
    /** `undefined` resets the panel to its default width. */
    onResize: (width: number | undefined) => void;
    /** How far below the viewport's top the panel sticks: under the toolbar. */
    stickyTopPx: number;
  };

  const {
    details,
    widthPx,
    minWidthPx,
    maxWidthPx,
    onResize,
    stickyTopPx,
  }: Props = $props();

  // With the summary above them naming the child by its id, and the header
  // naming its type, the steps needn't repeat either.
  const CHILD_IDENTITY_FIELDS = ['workflowId', 'workflowTypeName'];

  const isChildWorkflow = $derived(details.group.category === 'child-workflow');
  const childHref = $derived(
    details.child
      ? routeForTimeline({
          namespace: details.child.namespace,
          workflow: details.child.workflowId,
          run: details.child.runId,
          queryParams: getSharedFilterParams(page.url),
        })
      : undefined,
  );

  // The panel fills the room it has, so its edge runs the full height beside
  // the timeline however little it holds: from where it starts (its place in
  // the page, or under the toolbar once stuck) to whichever comes first, the
  // bottom of the screen or the end of the timeline. Any taller and a sticky
  // panel would be pushed up under the toolbar near the end.
  let panelEl = $state<HTMLElement | null>(null);
  let availableHeightPx = $state<number | null>(null);
  // Sitting above the frame's outline, the panel hides its bottom edge where
  // the two meet, so there it draws the frame's bottom corner itself.
  let reachesFrameBottom = $state(false);
  let contentScrolled = $state(false);
  $effect(() => {
    void stickyTopPx;
    const panel = panelEl;
    const row = panel?.parentElement;
    if (!panel || !row) return;
    // Sticky offsets count from the top of whatever scrolls the page, which
    // needn't be the top of the screen.
    let scroller: HTMLElement | null = row;
    while (
      scroller &&
      !/auto|scroll/.test(getComputedStyle(scroller).overflowY)
    ) {
      scroller = scroller.parentElement;
    }
    const measure = () => {
      // The panel stops at the inside of the row's border; counting the
      // border would make it a pixel too tall, pushing it up under the
      // toolbar.
      // Measured off the timeline column beside the panel, not the row: the
      // row grows with the panel, so it would only ever confirm its height.
      const rowRect = row.getBoundingClientRect();
      const timelineBottom = (
        panel.previousElementSibling ?? row
      ).getBoundingClientRect().bottom;
      const rowInnerBottom = Math.min(
        timelineBottom,
        rowRect.bottom - parseFloat(getComputedStyle(row).borderBottomWidth),
      );
      const bottom = Math.min(window.innerHeight, rowInnerBottom);
      const stuckTop =
        (scroller?.getBoundingClientRect().top ?? 0) + stickyTopPx;
      const top = Math.max(stuckTop, rowRect.top);
      availableHeightPx = Math.max(0, bottom - top);
      reachesFrameBottom = rowInnerBottom <= window.innerHeight + 0.5;
    };
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(panel);
    observer.observe(row);
    if (panel.previousElementSibling) {
      observer.observe(panel.previousElementSibling);
    }
    window.addEventListener('scroll', schedule, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    };
  });

  // Escape closes the panel unless something inside it, such as a resize
  // in progress, has already handled the key.
  $effect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      clearActiveGroups();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  });
</script>

<!-- Sits beside the timeline and sticks under the toolbar while the page
     scrolls, so the timeline itself never moves to make room for it. -->
<aside
  bind:this={panelEl}
  in:fly|global={{
    x: 24,
    duration: prefersReducedMotion.current ? 0 : 220,
    easing: cubicInOut,
  }}
  class="sticky z-10 flex shrink-0 flex-col self-start rounded-tr-lg border-l border-secondary bg-surface-primary"
  class:rounded-br-lg={reachesFrameBottom}
  style:top="{stickyTopPx}px"
  style:width="{widthPx}px"
  style:height={availableHeightPx === null
    ? `calc(100vh - ${stickyTopPx}px)`
    : `${availableHeightPx}px`}
  aria-label={translate('workflows.timeline-event-details')}
  data-testid="timeline-details-panel"
>
  <TimelineTreeResizeHandle
    width={widthPx}
    min={minWidthPx}
    max={maxWidthPx}
    {onResize}
    edge="start"
    label={translate('workflows.timeline-resize-event-details')}
  />
  <!-- Once its content scrolls under it, the header lifts off it with a
       shadow, as the timeline's header does while it sticks. -->
  <GroupDetailsHeader
    class="relative z-10 h-10 shrink-0 border-b border-primary transition-shadow duration-150 ease-in-out {contentScrolled
      ? 'shadow-[0_6px_8px_-6px_rgb(0_0_0/18%)] dark:shadow-[0_6px_10px_-6px_rgb(0_0_0/60%)]'
      : ''}"
    group={details.group}
    endTime={details.endTime}
    active={details.active}
    onClose={clearActiveGroups}
    variant="panel"
  />
  <div
    class="min-h-0 flex-1 overflow-y-auto"
    onscroll={(event) => (contentScrolled = event.currentTarget.scrollTop > 0)}
  >
    {#key details.timelineKey}
      {#if details.child}
        <TimelineChildSummarySection
          summary={details.child}
          nowMs={typeof details.endTime === 'number'
            ? details.endTime
            : Date.now()}
          workflowHref={childHref}
          onSelect={(timelineKey) => activeGroups.set([timelineKey])}
        />
      {/if}
      {#if isChildWorkflow && details.owner}
        <!-- A parent records three events about a child; saying whose
             history they come from explains both how few there are and
             how they're numbered. -->
        <h3 class="px-4 pt-4 text-xs font-medium text-secondary">
          {translate('workflows.timeline-recorded-by', {
            workflow: details.owner.workflowType || details.owner.workflowId,
          })}
        </h3>
      {/if}
      <EventDetailsFull
        group={details.group}
        event={details.group.initialEvent}
        lazy={true}
        groupRow={true}
        compact={true}
        historyOwner={details.owner}
        hiddenFields={details.child ? CHILD_IDENTITY_FIELDS : []}
      />
    {/key}
  </div>
  <LaneFrameCorner side="end" />
  <div
    class="pointer-events-none absolute inset-0 z-20 rounded-tr-lg border-r border-t border-secondary {reachesFrameBottom
      ? 'rounded-br-lg border-b'
      : ''}"
    aria-hidden="true"
  ></div>
</aside>
