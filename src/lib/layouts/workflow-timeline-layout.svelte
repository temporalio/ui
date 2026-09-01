<script lang="ts">
  import { getContext, onMount, tick } from 'svelte';

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
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconArrowAscending,
    IconArrowDescending,
    IconCollapse,
    IconDownload,
  } from '$lib/io/icon';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { isTimelineEventMarkerGroup } from '$lib/models/event-marker-groups';
  import { eventBuffer } from '$lib/services/grouped-event-buffer.svelte';
  import { clearActives, setActiveGroup } from '$lib/stores/active-events';
  import {
    collapseIdleTime,
    eventFilterSort,
    eventGroupsEnabled,
  } from '$lib/stores/event-view';
  import { pauseLiveUpdates } from '$lib/stores/events';
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

  const bufferLazyGroups = $derived(eventBuffer.lazyGroupsWithoutWorkflowTasks);
  const markerGroups = $derived(eventBuffer.eventMarkerGroups);
  const hasMarkerGroups = $derived(eventBuffer.hasEventMarkerGroups);
  let selectedMarkerKey = $state<string>();

  const filteredBufferLazyGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    return bufferLazyGroups.filter((group) => active.includes(group.category));
  });

  const selectedMarkerGroup = $derived(
    selectedMarkerKey
      ? markerGroups.find((group) => group.markerKey === selectedMarkerKey)
      : undefined,
  );

  $effect(() => {
    if (historyCtx.fetchComplete && !hasMarkerGroups && $eventGroupsEnabled) {
      clearActives();
      selectedMarkerKey = undefined;
      $eventGroupsEnabled = false;
    }
  });

  const groups = $derived.by(() => {
    if (!$eventGroupsEnabled) {
      return getTimelineGroups(
        filteredBufferLazyGroups,
        reverseSort,
        historyCtx.fetchComplete,
        historyCtx.descMinId,
      );
    }

    const outerGroups = getTimelineGroups(
      markerGroups,
      reverseSort,
      historyCtx.fetchComplete,
      historyCtx.descMinId,
    );
    if (!selectedMarkerGroup) return outerGroups;

    const lifecycleGroups = getTimelineGroups(
      selectedMarkerGroup.lifecycleGroups.filter((lifecycleGroup) =>
        $eventTypeFilter.includes(lifecycleGroup.category),
      ),
      reverseSort,
      true,
      0,
    );

    return outerGroups.flatMap((group) => {
      if (group.id !== selectedMarkerGroup.id) return group;

      // Keep the selected marker row as a header slot and place it at the
      // visual top of its lifecycle rows for either sort direction.
      return reverseSort
        ? [...lifecycleGroups, group]
        : [group, ...lifecycleGroups];
    });
  });

  // Expanding an Event Group changes the rendered rows, but the scale keeps
  // using the outer rows so selecting a group never reprojects the x-axis.
  const timelineGroups = $derived($eventGroupsEnabled ? markerGroups : groups);

  const workflowTaskFailedError = $derived.by(() => {
    if (!historyCtx.fetchComplete) return undefined;
    return eventBuffer.workflowTaskFailedEvent as
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

  const onEventGroupsToggle = () => {
    clearActives();
    selectedMarkerKey = undefined;
    const enabled = !$eventGroupsEnabled;
    $eventGroupsEnabled = enabled;
  };

  const onTimelineGroupSelect = async (group: EventGroup) => {
    if (isTimelineEventMarkerGroup(group)) {
      clearActives();
      selectedMarkerKey =
        selectedMarkerKey === group.markerKey ? undefined : group.markerKey;
      await tick();
      document
        .querySelector<HTMLButtonElement>('[data-testid="close-event-group"]')
        ?.focus();
      return;
    }
    setActiveGroup(group);
  };

  const closeSelectedEventGroup = async () => {
    const groupId = selectedMarkerGroup?.id;
    clearActives();
    selectedMarkerKey = undefined;
    await tick();

    if (groupId) {
      document.getElementById(groupId)?.focus();
    }
  };

  $effect(() => {
    if (
      selectedMarkerKey &&
      !markerGroups.some((group) => group.markerKey === selectedMarkerKey)
    ) {
      selectedMarkerKey = undefined;
      clearActives();
    }
  });

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
<div class="relative isolate z-0">
  <div
    class="surface-background sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-2 md:top-[var(--top-nav-height)] md:pt-2 xl:gap-8"
  >
    <div class="flex items-center gap-2">
      <h2>{translate('workflows.timeline-tab')}</h2>
      <EventHistoryLegend />
    </div>
    <div class="flex items-center gap-2">
      <ToggleButtons>
        <ToggleButton
          LeadingIcon={reverseSort ? IconArrowDescending : IconArrowAscending}
          data-testid="zoom-in"
          onclick={onSort}
          size="sm">{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
        >
        <ToggleButton
          LeadingIcon={IconCollapse}
          data-testid="toggle-idle-time"
          loading={!historyCtx.fetchComplete}
          disabled={!historyCtx.fetchComplete ||
            !timeline?.hasCollapsibleSegments}
          onclick={onToggleIdleTime}
          size="sm"
        >
          {timeline?.allCollapsibleSegmentsCollapsed
            ? translate('workflows.show-idle-time')
            : translate('workflows.hide-idle-time')}
        </ToggleButton>
        <EventTypeFilter compact={false} />
        <ToggleButton
          data-testid="event-groups"
          disabled={!hasMarkerGroups}
          size="sm"
          onclick={onEventGroupsToggle}
          class="border-l-0"
        >
          {$eventGroupsEnabled
            ? translate('workflows.hide-event-groups')
            : translate('workflows.show-event-groups')}
        </ToggleButton>
        <ToggleButton
          disabled={isNotPending}
          data-testid="pause"
          size="sm"
          onclick={onAutoRefreshToggle}
        >
          <span
            class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates || isNotPending
              ? 'bg-slate-300'
              : 'bg-green-600'}"
          ></span>
          {$pauseLiveUpdates || isNotPending
            ? translate('workflows.auto-refresh-off')
            : translate('workflows.auto-refresh-on')}
        </ToggleButton>
        <ToggleButton
          data-testid="download"
          LeadingIcon={IconDownload}
          size="sm"
          onclick={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
      </ToggleButtons>
    </div>
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
      {timelineGroups}
      selectedEventGroup={selectedMarkerGroup}
      onCloseEventGroup={closeSelectedEventGroup}
      {reverseSort}
      loading={!historyCtx.fetchComplete}
      totalExpectedEvents={estimatedTotalGroups}
      descMinId={historyCtx.descMinId}
      error={Boolean(workflowTaskFailedError)}
      onSelectGroup={onTimelineGroupSelect}
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
