<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/timeline-graph/timeline-graph.svelte';
  import type { Timeline } from '$lib/components/lines-and-dots/timeline-graph/timeline.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconArrowAscending,
    IconArrowDescending,
    IconCollapse,
  } from '$lib/io/icon';
  import type { EventGroupKey } from '$lib/models/event-history/event-group-markers';
  import {
    createTimelineEventGroupFilter,
    type TimelineEventGroup,
  } from '$lib/models/event-history/timeline-event-groups';
  import type { LazyGroup } from '$lib/services/grouped-event-buffer';
  import { getWorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';
  import type { EventSortOrder } from '$lib/stores/event-view';
  import type {
    EventTypeCategory,
    EventTypeFilterChange,
    PendingActivity,
  } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isFailedOrPendingGroup } from '$lib/utilities/get-failed-or-pending';
  import { getTimelineGroups } from '$lib/utilities/sort-timeline-groups';

  interface Props {
    namespace: string;
    workflow: WorkflowExecution;
    sort: EventSortOrder;
    onSortChange: (sort: EventSortOrder) => void;
    collapseIdleTime: boolean;
    onCollapseIdleTimeChange: (collapseIdleTime: boolean) => void;
    eventTypes: EventTypeCategory[];
    failedOrPendingOnly: boolean;
    onEventTypeFilterChange: (change: EventTypeFilterChange) => void;
    eventGroupKeys?: EventGroupKey[];
    eventGroupsVisible?: boolean;
    activeGroupId?: string;
    controls?: Snippet;
    activityActions?: Snippet<[PendingActivity]>;
  }

  let {
    namespace,
    workflow,
    sort,
    onSortChange,
    collapseIdleTime,
    onCollapseIdleTimeChange,
    eventTypes,
    failedOrPendingOnly,
    onEventTypeFilterChange,
    eventGroupKeys = [],
    eventGroupsVisible = false,
    activeGroupId = $bindable(),
    controls,
    activityActions,
  }: Props = $props();

  const historyController = getWorkflowHistoryController();

  const reverseSort = $derived(sort === 'descending');

  const bufferLazyGroups = $derived(
    historyController.history.lazyGroupsWithoutWorkflowTasks,
  );

  const eventGroupMatcher = $derived(
    historyController.history.eventGroupMatcher(eventGroupKeys),
  );

  const filteredBufferLazyGroups = $derived(
    bufferLazyGroups.filter(
      (group) =>
        eventTypes.includes(group.category) &&
        (!eventGroupMatcher || eventGroupMatcher.hasGroup(group.id)),
    ),
  );

  const timelineEventGroups = $derived(
    eventGroupsVisible ? historyController.history.timelineEventGroups : [],
  );
  const showEventGroups = $derived(timelineEventGroups.length > 0);
  let selectedEventGroupKey = $state<EventGroupKey>();

  const filterEventGroupsByType = createTimelineEventGroupFilter<LazyGroup>();

  const selectedEventGroupKeysParam = $derived(JSON.stringify(eventGroupKeys));
  const selectedEventGroupKeys = $derived(
    new Set<EventGroupKey>(JSON.parse(selectedEventGroupKeysParam)),
  );

  const filteredEventGroups = $derived.by(() => {
    const selectedKeys =
      selectedEventGroupKeys.size &&
      historyController.history.eventGroupOptions.some(({ group }) =>
        selectedEventGroupKeys.has(group.key),
      )
        ? selectedEventGroupKeys
        : undefined;
    return filterEventGroupsByType(
      selectedKeys
        ? timelineEventGroups.filter((group) => selectedKeys.has(group.key))
        : timelineEventGroups,
      (lifecycleGroup) =>
        eventTypes.includes(lifecycleGroup.category) &&
        (!failedOrPendingOnly || isFailedOrPendingGroup(lifecycleGroup)),
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
      activeGroupId = undefined;
    }
  });

  const lazyGroups: LazyGroup[] = $derived.by(() => {
    if (!showEventGroups) {
      return getTimelineGroups(
        filteredBufferLazyGroups,
        reverseSort,
        historyController.fetchComplete,
        historyController.descMinId,
      );
    }

    const eventGroupRows = getTimelineGroups(
      filteredEventGroups,
      reverseSort,
      historyController.fetchComplete,
      historyController.descMinId,
    );
    if (!selectedEventGroup) return eventGroupRows;

    const lifecycleRows = getTimelineGroups(
      selectedEventGroup.lifecycleGroups,
      reverseSort,
      historyController.fetchComplete,
      historyController.descMinId,
    );

    return eventGroupRows.flatMap((group): LazyGroup[] => {
      if (group !== selectedEventGroup) return [group];
      return reverseSort
        ? [...lifecycleRows, group]
        : [group, ...lifecycleRows];
    });
  });

  const onSelectEventGroup = (group: TimelineEventGroup) => {
    selectedEventGroupKey =
      selectedEventGroupKey === group.key ? undefined : group.key;
  };

  const onCloseEventGroup = () => {
    selectedEventGroupKey = undefined;
  };

  const hasWorkflowTaskFailedError = $derived(
    historyController.fetchComplete &&
      Boolean(historyController.history.workflowTaskFailedEvent),
  );

  const onSort = () => {
    onSortChange(reverseSort ? 'ascending' : 'descending');
  };

  // The timeline renders in normal page flow: the page (#content-wrapper)
  // scrolls it and the controls bar sticks to the top-nav. TimelineGraph
  // virtualizes internally via IntersectionObserver, so there's no bounded
  // scroll container, no scroll-offset bridge, and no height plumbing here.
  const estimatedTotalGroups = $derived.by(() => {
    if (historyController.fetchComplete) return lazyGroups.length;
    const totalEvents = historyController.totalExpectedEvents;
    return Math.max(lazyGroups.length, Math.ceil(totalEvents * 0.5));
  });

  onMount(() => historyController.resume());

  let timeline = $state<Timeline>();

  const handleTimelineInit = (initializedTimeline: Timeline) => {
    timeline = initializedTimeline;
  };

  const onToggleIdleTime = () => {
    if (!timeline) {
      return;
    }
    if (timeline.allCollapsibleSegmentsCollapsed) {
      timeline.expandAllSegments();
      onCollapseIdleTimeChange(false);
      return;
    }
    timeline.collapseAllSegments();
    onCollapseIdleTimeChange(true);
  };
</script>

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
      <ToggleButtons class="[&_.menu-button-anchor>button]:rounded">
        <EventTypeFilter
          compact={false}
          {eventTypes}
          statusFilter={failedOrPendingOnly}
          onChange={onEventTypeFilterChange}
        />
      </ToggleButtons>
      <EventHistoryLegend />
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <ToggleButtons>
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
          loading={historyController.loading}
          disabled={!historyController.fetchComplete ||
            !timeline?.hasCollapsibleSegments}
          onclick={onToggleIdleTime}
          size="sm"
          variant="tertiary"
        >
          {timeline?.allCollapsibleSegmentsCollapsed
            ? translate('workflows.show-idle-time')
            : translate('workflows.hide-idle-time')}
        </ToggleButton>
      </ToggleButtons>
      {@render controls?.()}
    </div>
  </div>

  <TimelineGraph
    {namespace}
    {workflow}
    history={historyController.history}
    {lazyGroups}
    latestEventTimeMs={historyController.history.latestEventTimeMs}
    scaleGroups={filteredBufferLazyGroups}
    {selectedEventGroup}
    {onSelectEventGroup}
    {onCloseEventGroup}
    {reverseSort}
    bind:activeGroupId
    {collapseIdleTime}
    {failedOrPendingOnly}
    loading={historyController.loading}
    totalExpectedEvents={estimatedTotalGroups}
    showLoadingRows={!showEventGroups}
    descMinId={historyController.descMinId}
    error={hasWorkflowTaskFailedError}
    onTimelineInit={handleTimelineInit}
    {activityActions}
  />
</div>
