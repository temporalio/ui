<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/timeline-graph/timeline-graph.svelte';
  import type { Timeline } from '$lib/components/lines-and-dots/timeline-graph/timeline.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import CommandRail from '$lib/holocene/command-rail.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    enrichGroups,
    getWorkflowTaskFailedEvent as getBufferWftFailedEvent,
    getGroupArray,
  } from '$lib/services/grouped-event-buffer';
  import { clearActives } from '$lib/stores/active-events';
  import { collapseIdleTime, eventFilterSort } from '$lib/stores/event-view';
  import { bufferVersion, pauseLiveUpdates } from '$lib/stores/events';
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
  import { getTimelineGroups } from '$lib/utilities/sort-timeline-groups';

  const historyCtx = getContext<HistoryContext>(HISTORY_CTX);

  const namespace = $derived(page.params.namespace);
  const workflow = $derived($workflowRun.workflow);

  const urlParams = $derived(parseEventFilterParams(page.url));
  $effect(() => {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
  });

  const onAutoRefreshToggle = () => {
    updateEventFilterParams(
      page.url,
      { refresh_off: !$pauseLiveUpdates },
      goto,
    );
  };

  const reverseSort = $derived($eventFilterSort === 'descending');

  let bufferGroups = $state.raw<EventGroup[]>([]);

  const filteredBufferGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    return bufferGroups.filter((g) => active.includes(g.category));
  });

  const groups = $derived(
    getTimelineGroups(
      filteredBufferGroups,
      reverseSort,
      historyCtx.fetchComplete,
      historyCtx.descMinId,
    ),
  );

  const workflowTaskFailedError = $derived.by(() => {
    void $bufferVersion;
    if (!historyCtx.fetchComplete) return undefined;
    return getBufferWftFailedEvent() as
      | WorkflowTaskFailedEvent
      | WorkflowTaskTimedOutEvent
      | undefined;
  });

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

  // The timeline renders in normal page flow: the page (#content-wrapper)
  // scrolls it and the controls bar sticks to the top-nav. TimelineGraph
  // virtualizes internally via IntersectionObserver, so there's no bounded
  // scroll container, no scroll-offset bridge, and no height plumbing here.
  const estimatedTotalGroups = $derived.by(() => {
    if (historyCtx.fetchComplete) return groups.length;
    const totalEvents = historyCtx.totalExpectedEvents ?? 0;
    return Math.max(groups.length, Math.ceil(totalEvents * 0.5));
  });

  onMount(() => {
    historyCtx.resume();
    bufferGroups = getGroupArray({ excludeWorkflowTasks: true });
  });

  $effect(() => {
    void $bufferVersion;
    const fetchComplete = historyCtx.fetchComplete;
    const pendingActivities = $workflowRun.workflow?.pendingActivities ?? [];
    const pendingNexusOperations =
      $workflowRun.workflow?.pendingNexusOperations ?? [];

    let frame: number | null = requestAnimationFrame(() => {
      frame = null;
      if (fetchComplete) {
        enrichGroups(pendingActivities, pendingNexusOperations);
      }
      bufferGroups = getGroupArray({ excludeWorkflowTasks: true });
    });

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  });

  let timeline = $state<Timeline>();

  const handleTimelineInit = (t: Timeline) => {
    timeline = t;
  };

  const onToggleIdleTime = () => {
    if (!timeline) return;
    if (timeline.allCollapsibleSegmentsCollapsed) {
      timeline.expandAllSegments();
      $collapseIdleTime = 'off';
    } else {
      timeline.collapseAllSegments();
      $collapseIdleTime = 'on';
    }
  };
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

<!--
  Wrapper: single flex child so the parent's gap-4 only applies once (above
  this block). The controls bar sticks below the top-nav while the page scrolls
  the timeline past it; the timeline virtualizes itself via IntersectionObserver.
-->
<div>
  <div
    class="surface-background sticky top-[var(--target-size)] z-sticky flex h-target min-w-0 items-center gap-3 border-b border-subtle md:top-[calc(var(--top-nav-height)+var(--control-height-sm))] md:h-[calc(var(--control-height-sm)+0.5rem)]"
  >
    <h2 class="shrink-0">{translate('workflows.timeline-tab')}</h2>
    <CommandRail
      label={translate('workflows.timeline-controls')}
      role="group"
      class="h-full min-w-0 flex-1"
      viewportClass="flex h-full items-center gap-3"
      id="timeline-command-rail-viewport"
      data-testid="timeline-command-rail"
    >
      <div class="flex shrink-0 items-center">
        <EventHistoryLegend />
      </div>
      <ToggleButtons class="ml-auto shrink-0">
        <ToggleButton
          leadingIcon={reverseSort ? 'descending' : 'ascending'}
          data-testid="zoom-in"
          onclick={onSort}
          size="sm"
          showLabelOnSmallScreens
          >{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
        >
        <ToggleButton
          leadingIcon="timeline-collapse"
          data-testid="toggle-idle-time"
          loading={!historyCtx.fetchComplete}
          disabled={!historyCtx.fetchComplete ||
            !timeline?.hasCollapsibleSegments}
          onclick={onToggleIdleTime}
          size="sm"
          showLabelOnSmallScreens
        >
          {timeline?.allCollapsibleSegmentsCollapsed
            ? translate('workflows.show-idle-time')
            : translate('workflows.hide-idle-time')}
        </ToggleButton>
        <EventTypeFilter compact={false} showLabelOnSmallScreens />
        <ToggleButton
          disabled={isNotPending}
          active={!$pauseLiveUpdates && !isNotPending}
          aria-label={$pauseLiveUpdates || isNotPending
            ? translate('workflows.auto-refresh-off')
            : translate('workflows.auto-refresh-on')}
          data-testid="pause"
          size="sm"
          onclick={onAutoRefreshToggle}
        >
          <span
            class="h-1.5 w-1.5 rounded-full border {$pauseLiveUpdates ||
            isNotPending
              ? 'border-subtle bg-subtle'
              : 'border-success bg-success'}"
          ></span>
          {isNotPending
            ? translate('workflows.auto-refresh-unavailable')
            : $pauseLiveUpdates
              ? translate('workflows.auto-refresh-paused')
              : translate('workflows.auto-refresh-live')}
        </ToggleButton>
        <ToggleButton
          data-testid="download"
          leadingIcon="download"
          size="sm"
          showLabelOnSmallScreens
          onclick={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
      </ToggleButtons>
    </CommandRail>
  </div>

  <!--
  Timeline in page flow: it's a tall element the page scrolls, and it
  virtualizes itself via IntersectionObserver (no bounded scroll container,
  no scroll-offset bridge).
-->
  {#if workflow}
    <TimelineGraph
      {workflow}
      {groups}
      {reverseSort}
      loading={!historyCtx.fetchComplete}
      totalExpectedEvents={estimatedTotalGroups}
      descMinId={historyCtx.descMinId}
      error={Boolean(workflowTaskFailedError)}
      onTimelineInit={handleTimelineInit}
    />
  {/if}
</div>
<!-- end wrapper -->

{#if workflow}
  <DownloadEventHistoryModal
    bind:open={showDownloadPrompt}
    {namespace}
    workflowId={workflow.id}
    runId={workflow.runId}
  />
{/if}
