<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    enrichGroups,
    getWorkflowTaskFailedEvent as getBufferWftFailedEvent,
    getGroupArray,
    onLatestGroup,
  } from '$lib/services/grouped-event-buffer';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventTypeFilter } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import { orderGroupsByPending } from '$lib/utilities/order-groups-by-pending';

  const historyCtx = getContext<HistoryContext>(HISTORY_CTX);

  const namespace = $derived(page.params.namespace);
  const workflow = $derived($workflowRun.workflow);

  const urlParams = $derived(parseEventFilterParams(page.url));
  $effect(() => {
    $eventFilterSort = urlParams.sort;
  });

  const reverseSort = $derived($eventFilterSort === 'descending');

  let bufferGroups = $state<EventGroup[]>([]);

  const filteredBufferGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    return bufferGroups.filter((g) => active.includes(g.category));
  });

  const groups = $derived(
    orderGroupsByPending(filteredBufferGroups, !reverseSort),
  );

  const workflowTaskFailedError = $derived(
    historyCtx.fetchComplete
      ? (getBufferWftFailedEvent() as
          | WorkflowTaskFailedEvent
          | WorkflowTaskTimedOutEvent
          | undefined)
      : undefined,
  );

  const isNotPending = $derived(
    Boolean(workflow && !workflow?.isRunning && !workflow?.isPaused),
  );

  beforeNavigate(() => {
    clearActives();
  });

  let showDownloadPrompt = $state(false);

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams(page.url, { sort: newSort }, goto);
  };

  // ── Sticky canvas + sentinel scroll (mirrors fasterer page pattern) ────────
  // The outer #content-wrapper scrolls. The sentinel sits at the top of the
  // canvas area. Once content above it scrolls off, the sticky wrapper locks
  // to the viewport. The sentinel's getBoundingClientRect().top drives scrollY
  // so TimelineGraph's per-row guard knows which rows are visible.

  let sentinelEl = $state<HTMLDivElement | null>(null);
  let scrollContainerEl: HTMLElement | null = null;
  let timelineScrollY = $state(0);

  // Total pixel height for the spacer that extends the page scroll range.
  // spacer = timelineHeight − stickyHeight so that when scrollTop reaches its
  // maximum the bottom axis line aligns with the bottom of the viewport.
  // timelineHeight = (groups + 2) * ROW_PX (mirrors timeline-graph.svelte).
  // stickyHeight is measured via bind:clientHeight on the sticky canvas div.
  const ROW_PX = 24;
  let stickyHeight = $state(0);
  let graphPanelHeight = $state(0);
  const spacerHeight = $derived(
    Math.max((groups.length + 2) * ROW_PX, 120) -
      stickyHeight +
      graphPanelHeight,
  );

  // Sentinel's layout position within the scroll container — measured once at
  // mount so the hot-path scroll handler uses only arithmetic (no
  // getBoundingClientRect(), which forces layout after DOM mutations).
  let sentinelOffset = 0;

  onMount(() => {
    historyCtx.resume();
    bufferGroups = getGroupArray({ excludeWorkflowTasks: true });

    scrollContainerEl = document.getElementById('content-wrapper');

    if (scrollContainerEl && sentinelEl) {
      // One-time layout read: sentinel position relative to scroll container.
      // scrollTop is 0 at mount, so BoundingClientRect.top equals the
      // document-relative offset minus the container's top.
      const containerRect = scrollContainerEl.getBoundingClientRect();
      const sentinelRect = sentinelEl.getBoundingClientRect();
      sentinelOffset =
        sentinelRect.top - containerRect.top + scrollContainerEl.scrollTop;

      // Scroll tracking: dirty-flag + perpetual RAF tick.
      //
      // The scroll event handler does NOTHING except flip a boolean — zero layout
      // reads, zero Svelte writes. This means CodeMirror's observers.scroll (which
      // also listens on #content-wrapper) reads scrollTop / getBoundingClientRect
      // against an untouched DOM → no forced style recalculation of SVG children.
      //
      // The RAF tick runs once per animation frame (before paint). At that point:
      //   • The previous frame's Svelte writes have been painted → DOM is clean.
      //   • We read scrollTop (clean read, no pending mutations from us).
      //   • Then we write timelineScrollY (dirty write — Svelte queues effects).
      //   • Browser recalculates SVG styles naturally as part of the render pipeline.
      //
      // Result: zero forced reflows in the scroll hot-path.
      let scrollDirty = false;
      let prevScrollY = -1;
      let rafId = 0;

      const markDirty = () => {
        scrollDirty = true;
      };
      scrollContainerEl.addEventListener('scroll', markDirty, {
        passive: true,
      });

      const tick = () => {
        if (scrollDirty) {
          scrollDirty = false;
          const rawY = Math.max(
            0,
            scrollContainerEl.scrollTop - sentinelOffset,
          );
          if (rawY !== prevScrollY) {
            prevScrollY = rawY;
            timelineScrollY = rawY;
          }
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      // Throttle buffer → Svelte updates to at most once per animation frame.
      // onLatestGroup fires for every new group head (~N times during load),
      // each triggering getGroupArray() (O(N log N) sort) + full Svelte
      // reactive cascade. Batching via rAF reduces that to ≤60 updates/sec
      // regardless of how fast the bidirectional cursors push data.
      let groupUpdatePending = false;
      const unsub = onLatestGroup(() => {
        if (!groupUpdatePending) {
          groupUpdatePending = true;
          requestAnimationFrame(() => {
            groupUpdatePending = false;
            bufferGroups = getGroupArray({ excludeWorkflowTasks: true });
          });
        }
      });

      return () => {
        scrollContainerEl?.removeEventListener('scroll', markDirty);
        cancelAnimationFrame(rafId);
        unsub();
      };
    }

    let groupUpdatePending = false;
    const unsub = onLatestGroup(() => {
      if (!groupUpdatePending) {
        groupUpdatePending = true;
        requestAnimationFrame(() => {
          groupUpdatePending = false;
          bufferGroups = getGroupArray({ excludeWorkflowTasks: true });
        });
      }
    });
    return () => unsub();
  });

  $effect(() => {
    if (historyCtx.fetchComplete) {
      enrichGroups(
        $workflowRun.workflow?.pendingActivities ?? [],
        $workflowRun.workflow?.pendingNexusOperations ?? [],
      );
      bufferGroups = getGroupArray({ excludeWorkflowTasks: true });
    }
  });
</script>

<InputAndResults />
<div class="flex flex-col gap-2">
  {#if workflowTaskFailedError}
    <WorkflowError
      error={workflowTaskFailedError}
      pendingTask={workflow?.pendingWorkflowTask}
    />
  {/if}
  {#if workflow?.callbacks?.length}
    <WorkflowCallbacks callbacks={workflow.callbacks} />
  {/if}
</div>

<div
  class="surface-background sticky top-0 z-[11] flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-2 md:top-[var(--top-nav-height)] md:pt-2 xl:gap-8"
>
  <div class="flex items-center gap-2">
    <h2>{translate('workflows.timeline-tab')}</h2>
    <EventHistoryLegend />
  </div>
  <div class="flex items-center gap-2">
    <ToggleButtons>
      <ToggleButton
        leadingIcon={reverseSort ? 'descending' : 'ascending'}
        data-testid="zoom-in"
        on:click={onSort}
        size="sm">{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
      >
      <EventTypeFilter compact={false} />
      <ToggleButton
        disabled={isNotPending}
        data-testid="pause"
        class="border-l-0"
        size="sm"
        on:click={() => {}}
      >
        <span
          class="h-1.5 w-1.5 rounded-full {isNotPending
            ? 'bg-slate-300'
            : 'bg-green-600'}"
        ></span>
        {isNotPending
          ? translate('workflows.auto-refresh-off')
          : translate('workflows.auto-refresh-on')}
      </ToggleButton>
      <ToggleButton
        data-testid="download"
        leadingIcon="download"
        size="sm"
        on:click={() => (showDownloadPrompt = true)}
      >
        {translate('common.download')}
      </ToggleButton>
    </ToggleButtons>
  </div>
</div>

<!--
  Sentinel: zero-height element marking the top of the canvas area.
  Its viewport-relative top gives us timelineScrollY without tracking heights.
-->
<div bind:this={sentinelEl} class="pointer-events-none h-0"></div>

<!--
  Sticky canvas: locks below top-nav once the content above scrolls off.
  Negative horizontal margins make it edge-to-edge (cancels page shell padding).
  overflow-hidden clips TimelineGraph so it doesn't expand the page height.
-->
<div
  class="sticky -mx-4 overflow-hidden md:-mx-8"
  style="top: var(--top-nav-height, 3rem); height: calc(100dvh - var(--top-nav-height, 3rem));"
  bind:clientHeight={stickyHeight}
>
  {#if workflow}
    <TimelineGraph
      {workflow}
      {groups}
      {reverseSort}
      loading={!historyCtx.fetchComplete}
      scrollY={timelineScrollY}
      totalExpectedEvents={historyCtx.totalExpectedEvents}
      descMinId={historyCtx.descMinId}
      error={Boolean(workflowTaskFailedError)}
      bind:panelHeight={graphPanelHeight}
    />
  {/if}
</div>

<!--
  Spacer: extends #content-wrapper's scroll range to cover the full timeline height.
  The sentinel + scroll handler convert that scrollTop into timelineScrollY.
-->
<div class="pointer-events-none" style="height: {spacerHeight}px;"></div>

{#if workflow}
  <DownloadEventHistoryModal
    bind:open={showDownloadPrompt}
    {namespace}
    workflowId={workflow.id}
    runId={workflow.runId}
  />
{/if}
