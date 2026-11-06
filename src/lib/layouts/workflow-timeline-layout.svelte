<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventGroupControls from '$lib/components/lines-and-dots/event-group-filter/event-group-controls.svelte';
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
  import type { EventGroupKey } from '$lib/models/event-history/event-group-markers';
  import {
    createTimelineEventGroupFilter,
    isTimelineEventGroup,
  } from '$lib/models/event-history/timeline-event-groups';
  import type { LazyGroup } from '$lib/services/grouped-event-buffer';
  import { eventBuffer } from '$lib/services/grouped-event-buffer.svelte';
  import { clearActives, setActiveGroup } from '$lib/stores/active-events';
  import {
    collapseIdleTime,
    eventFilterSort,
    showTimelineEventGroups,
  } from '$lib/stores/event-view';
  import { pauseLiveUpdates } from '$lib/stores/events';
  import { eventStatusFilter, eventTypeFilter } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import { isFailedOrPendingGroup } from '$lib/utilities/get-failed-or-pending';
  import { getTimelineGroups } from '$lib/utilities/sort-timeline-groups';

  const historyCtx = getContext<HistoryContext>(HISTORY_CTX);

  const namespace = $derived(page.params.namespace);
  const workflow = $derived($workflowRun.workflow);

  const urlParams = $derived(parseEventFilterParams(page.url));
  $effect(() => {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
    $eventStatusFilter = urlParams.statusFilter;
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

  const eventGroupMatcher = $derived(
    eventBuffer.eventGroupMatcher(urlParams.eventGroups),
  );

  const filteredBufferLazyGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    return bufferLazyGroups.filter(
      (g) =>
        active.includes(g.category) &&
        (!eventGroupMatcher || eventGroupMatcher.hasGroup(g.id)),
    );
  });

  const hasTimelineEventGroups = $derived(
    eventBuffer.timelineEventGroups.length > 0,
  );
  const timelineEventGroups = $derived(
    $showTimelineEventGroups ? eventBuffer.timelineEventGroups : [],
  );
  const showEventGroups = $derived(timelineEventGroups.length > 0);
  let selectedEventGroupKey = $state<EventGroupKey>();

  const filterEventGroupsByType = createTimelineEventGroupFilter<LazyGroup>();

  const selectedEventGroupKeysParam = $derived(
    JSON.stringify(urlParams.eventGroups),
  );
  const selectedEventGroupKeys = $derived(
    new Set<EventGroupKey>(JSON.parse(selectedEventGroupKeysParam)),
  );

  const filteredEventGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    const statusFilter = $eventStatusFilter;
    const selectedKeys =
      selectedEventGroupKeys.size &&
      eventBuffer.eventGroupOptions.some(({ group }) =>
        selectedEventGroupKeys.has(group.key),
      )
        ? selectedEventGroupKeys
        : undefined;
    return filterEventGroupsByType(
      selectedKeys
        ? timelineEventGroups.filter((group) => selectedKeys.has(group.key))
        : timelineEventGroups,
      (lifecycleGroup) =>
        active.includes(lifecycleGroup.category) &&
        (!statusFilter || isFailedOrPendingGroup(lifecycleGroup)),
    );
  });

  const selectedEventGroup = $derived(
    showEventGroups && selectedEventGroupKey
      ? filteredEventGroups.find((group) => group.key === selectedEventGroupKey)
      : undefined,
  );

  $effect(() => {
    if (selectedEventGroupKey && !selectedEventGroup) {
      selectedEventGroupKey = undefined;
      clearActives();
    }
  });

  const lazyGroups: LazyGroup[] = $derived.by(() => {
    if (!showEventGroups) {
      return getTimelineGroups(
        filteredBufferLazyGroups,
        reverseSort,
        historyCtx.fetchComplete,
        historyCtx.descMinId,
      );
    }

    const eventGroupRows = getTimelineGroups(
      filteredEventGroups,
      reverseSort,
      historyCtx.fetchComplete,
      historyCtx.descMinId,
    );
    if (!selectedEventGroup) return eventGroupRows;

    const lifecycleRows = getTimelineGroups(
      selectedEventGroup.lifecycleGroups,
      reverseSort,
      historyCtx.fetchComplete,
      historyCtx.descMinId,
    );

    return eventGroupRows.flatMap((group): LazyGroup[] => {
      if (group !== selectedEventGroup) return [group];
      return reverseSort
        ? [...lifecycleRows, group]
        : [group, ...lifecycleRows];
    });
  });

  const onEventGroupsToggle = () => {
    clearActives();
    selectedEventGroupKey = undefined;
    $showTimelineEventGroups = !$showTimelineEventGroups;
  };

  const onSelectGroup = (group: EventGroup) => {
    if (!isTimelineEventGroup(group)) {
      setActiveGroup(group);
      return;
    }
    clearActives();
    selectedEventGroupKey =
      selectedEventGroupKey === group.key ? undefined : group.key;
  };

  const onCloseEventGroup = () => {
    clearActives();
    selectedEventGroupKey = undefined;
  };

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

  // The timeline renders in normal page flow: the page (#content-wrapper)
  // scrolls it and the controls bar sticks to the top-nav. TimelineGraph
  // virtualizes internally via IntersectionObserver, so there's no bounded
  // scroll container, no scroll-offset bridge, and no height plumbing here.
  const estimatedTotalGroups = $derived.by(() => {
    if (historyCtx.fetchComplete) return lazyGroups.length;
    const totalEvents = historyCtx.totalExpectedEvents ?? 0;
    return Math.max(lazyGroups.length, Math.ceil(totalEvents * 0.5));
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
<div>
  <div
    class="sticky top-0 z-[11] flex flex-wrap items-center justify-between gap-2 bg-background-primary pb-2 text-primary md:top-[var(--top-nav-height)] md:pt-2 xl:gap-8"
  >
    <div class="flex items-center gap-2">
      <h2>{translate('workflows.timeline-tab')}</h2>
      <EventHistoryLegend />
    </div>
    <div class="flex flex-wrap items-center gap-2 xl:gap-x-0">
      <ToggleButtons
        class="max-xl:[&>:last-child_.menu-button-anchor>button]:rounded-r"
      >
        <ToggleButton
          LeadingIcon={reverseSort ? IconArrowDescending : IconArrowAscending}
          data-testid="zoom-in"
          onclick={onSort}
          size="sm"
          variant="tertiary"
        >
          {reverseSort ? 'Descending' : 'Ascending'}
        </ToggleButton>
        <ToggleButton
          LeadingIcon={IconCollapse}
          data-testid="toggle-idle-time"
          loading={!historyCtx.fetchComplete}
          disabled={!historyCtx.fetchComplete ||
            !timeline?.hasCollapsibleSegments}
          onclick={onToggleIdleTime}
          size="sm"
          variant="tertiary"
        >
          {timeline?.allCollapsibleSegmentsCollapsed
            ? translate('workflows.show-idle-time')
            : translate('workflows.hide-idle-time')}
        </ToggleButton>
        <EventTypeFilter compact={false} />
      </ToggleButtons>
      <ToggleButtons
        class={hasTimelineEventGroups
          ? 'empty:hidden max-xl:[&>:last-child_.menu-button-anchor>button]:rounded-r'
          : 'empty:hidden max-xl:[&_.menu-button-anchor>button]:rounded max-xl:[&_.menu-button-anchor>button]:border-l'}
      >
        <EventGroupControls options={eventBuffer.eventGroupOptions}>
          {#snippet toggle()}
            {#if hasTimelineEventGroups}
              <ToggleButton
                data-testid="toggle-event-groups"
                size="sm"
                variant="tertiary"
                class="max-xl:rounded-l xl:border-l-0 [&:not(:last-child)]:border-r"
                onclick={onEventGroupsToggle}
              >
                {$showTimelineEventGroups
                  ? translate('workflows.hide-event-groups')
                  : translate('workflows.show-event-groups')}
              </ToggleButton>
            {/if}
          {/snippet}
        </EventGroupControls>
      </ToggleButtons>
      <ToggleButtons>
        <ToggleButton
          disabled={isNotPending}
          data-testid="pause"
          class="xl:!rounded-l-none xl:border-l-0"
          size="sm"
          variant="tertiary"
          onclick={onAutoRefreshToggle}
        >
          <span
            class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates || isNotPending
              ? 'bg-content-tertiary'
              : 'bg-content-static-success'}"
          ></span>
          {$pauseLiveUpdates || isNotPending
            ? translate('workflows.auto-refresh-off')
            : translate('workflows.auto-refresh-on')}
        </ToggleButton>
        <ToggleButton
          data-testid="download"
          LeadingIcon={IconDownload}
          size="sm"
          variant="tertiary"
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
      {lazyGroups}
      scaleGroups={filteredBufferLazyGroups}
      {selectedEventGroup}
      {onSelectGroup}
      {onCloseEventGroup}
      {reverseSort}
      loading={!historyCtx.fetchComplete}
      totalExpectedEvents={estimatedTotalGroups}
      showLoadingRows={!showEventGroups}
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
