<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventFilter, {
    type FilterAction,
    type FilterToggle,
  } from '$lib/components/lines-and-dots/event-filter.svelte';
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
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { allEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
  import {
    enrichGroups,
    getWorkflowTaskFailedEvent as getBufferWftFailedEvent,
    getGroupArray,
  } from '$lib/services/grouped-event-buffer';
  import { clearActives } from '$lib/stores/active-events';
  import { collapseIdleTime, eventFilterSort } from '$lib/stores/event-view';
  import { bufferVersion, pauseLiveUpdates } from '$lib/stores/events';
  import {
    eventAttributeFilter,
    eventClassificationFilter,
    eventTypeFilter,
  } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import {
    filterableEventClassifications,
    filterEventGroups,
  } from '$lib/utilities/event-group-filters';
  import { getTimelineGroups } from '$lib/utilities/sort-timeline-groups';

  const historyCtx = getContext<HistoryContext>(HISTORY_CTX);

  const namespace = $derived(page.params.namespace);
  const workflow = $derived($workflowRun.workflow);

  const urlParams = $derived(parseEventFilterParams(page.url));
  $effect(() => {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
  });

  $effect(() => {
    $eventTypeFilter =
      urlParams.categories ?? allEventTypeOptions.map(({ value }) => value);
    $eventClassificationFilter = urlParams.classifications ?? [
      ...filterableEventClassifications,
    ];
    $eventAttributeFilter = urlParams.attributes ?? [];
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

  const filteredBufferGroups = $derived(
    filterEventGroups(bufferGroups, {
      categories: $eventTypeFilter,
      classifications: $eventClassificationFilter,
      attributes: $eventAttributeFilter,
    }),
  );

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

  const liveUpdatesOn = $derived(!$pauseLiveUpdates && !isNotPending);

  const viewToggles = $derived<FilterToggle[]>([
    {
      id: 'timeline-hide-idle-time',
      label: translate('workflows.hide-idle-time'),
      icon: 'timeline-collapse',
      checked: Boolean(timeline?.allCollapsibleSegmentsCollapsed),
      disabled: !historyCtx.fetchComplete || !timeline?.hasCollapsibleSegments,
      onChange: onToggleIdleTime,
    },
    {
      id: 'timeline-auto-refresh',
      label: liveUpdatesOn
        ? translate('workflows.auto-refresh-on')
        : translate('workflows.auto-refresh-off'),
      liveIndicator: true,
      checked: liveUpdatesOn,
      disabled: isNotPending,
      onChange: onAutoRefreshToggle,
    },
  ]);

  const viewActions = $derived<FilterAction[]>([
    {
      id: 'timeline-sort-direction',
      label: reverseSort
        ? translate('common.descending')
        : translate('common.ascending'),
      icon: reverseSort ? 'descending' : 'ascending',
      onClick: onSort,
    },
    {
      id: 'timeline-download',
      label: translate('common.download'),
      icon: 'download',
      onClick: () => (showDownloadPrompt = true),
    },
  ]);
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
    class="surface-background sticky top-0 z-[11] border-b border-subtle pb-2 md:top-[var(--top-nav-height)] md:pt-2"
  >
    <h2>{translate('workflows.timeline-tab')}</h2>
    <EventFilter
      groups={bufferGroups}
      toggles={viewToggles}
      actions={viewActions}
    />
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
