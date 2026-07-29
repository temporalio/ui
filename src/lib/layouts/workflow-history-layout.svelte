<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventFilter, {
    type FilterAction,
    type FilterToggle,
    type FilterView,
  } from '$lib/components/lines-and-dots/event-filter.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import { translate } from '$lib/i18n/translate';
  import { buildGroupIndex } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import {
    allEventTypeOptions,
    isCategoryType,
  } from '$lib/models/event-history/get-event-categorization';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import {
    enrichGroups,
    getWorkflowTaskFailedEvent as getBufferWftFailedEvent,
    getEventArray,
    getGroupArray,
  } from '$lib/services/grouped-event-buffer';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { bufferVersion, pauseLiveUpdates } from '$lib/stores/events';
  import {
    eventAttributeFilter,
    eventCategoryFilter,
    eventClassificationFilter,
    eventTypeFilter,
  } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    IterableEventWithPending,
    WorkflowEvent,
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import {
    countBy,
    filterableEventClassifications,
    passesStatusFacet,
  } from '$lib/utilities/event-group-filters';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { orderGroupsByPending } from '$lib/utilities/order-groups-by-pending';

  const historyCtx = getContext<HistoryContext>(HISTORY_CTX);

  const { namespace } = $derived(page.params);
  const { workflow } = $derived($workflowRun);
  const pendingActivities = $derived(workflow?.pendingActivities ?? []);
  const pendingNexusOperations = $derived(
    workflow?.pendingNexusOperations ?? [],
  );

  $effect(() => {
    const urlParams = parseEventFilterParams(page.url);
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
    $eventTypeFilter =
      urlParams.categories ?? allEventTypeOptions.map(({ value }) => value);
    $eventClassificationFilter = urlParams.classifications ?? [
      ...filterableEventClassifications,
    ];
    $eventAttributeFilter = urlParams.attributes ?? [];
  });

  $effect(() => {
    const category = page.url?.searchParams?.get('category');
    $eventCategoryFilter = category
      ? category.split(',').filter(isCategoryType)
      : undefined;
  });

  let reverseSort = $derived($eventFilterSort === 'descending');
  let compact = $derived($eventViewType === 'compact');

  let bufferGroups = $state.raw(getGroupArray({ excludeWorkflowTasks: true }));
  let bufferEvents = $state.raw(getEventArray());
  let updating = $derived(!historyCtx.fetchComplete);

  onMount(() => {
    historyCtx.resume();
    bufferGroups = getGroupArray({ excludeWorkflowTasks: true });
    bufferEvents = getEventArray();
  });

  $effect(() => {
    void $bufferVersion;

    const fetchComplete = historyCtx.fetchComplete;
    const activities = pendingActivities;
    const nexusOperations = pendingNexusOperations;

    let frame: number | null = requestAnimationFrame(() => {
      frame = null;
      if (fetchComplete) {
        enrichGroups(activities, nexusOperations);
      }
      bufferGroups = getGroupArray({ excludeWorkflowTasks: true });
      bufferEvents = getEventArray();
    });

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  });

  const pendingOnly = $derived($eventAttributeFilter.includes('pending'));

  const eventCategoryForCounting = (event: WorkflowEvent) =>
    isLocalActivityMarkerEvent(event) ? 'local-activity' : event.category;

  const panelCounts = $derived(
    compact
      ? undefined
      : { category: countBy(bufferEvents, eventCategoryForCounting) },
  );

  const statusFiltering = $derived(
    $eventClassificationFilter.length < filterableEventClassifications.length,
  );

  const groupIndex = $derived(
    pendingOnly || statusFiltering ? buildGroupIndex(bufferGroups) : undefined,
  );

  const filteredGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    const cats = $eventCategoryFilter;
    return bufferGroups.filter((g) => {
      if (!active.includes(g.category)) return false;
      if (cats && cats.length && !cats.includes(g.category)) return false;
      if (pendingOnly && !g.isPending) return false;
      if (statusFiltering && !passesStatusFacet(g, $eventClassificationFilter))
        return false;
      return true;
    });
  });

  const filteredEvents = $derived.by(() => {
    const active = $eventTypeFilter;
    const cats = $eventCategoryFilter;
    return bufferEvents.filter((ev) => {
      const cat = eventCategoryForCounting(ev);
      if (!active.includes(cat)) return false;
      if (cats && cats.length && !cats.includes(cat)) return false;
      if (!groupIndex) return true;
      const group = groupIndex.get(ev.id);
      if (!group) return false;
      if (pendingOnly && !group.isPending) return false;
      if (
        statusFiltering &&
        !passesStatusFacet(group, $eventClassificationFilter)
      )
        return false;
      return true;
    });
  });

  const workflowTaskFailedError = $derived.by(() => {
    void $bufferVersion;
    if (!historyCtx.fetchComplete) return undefined;
    return getBufferWftFailedEvent() as
      | WorkflowTaskFailedEvent
      | WorkflowTaskTimedOutEvent
      | undefined;
  });

  const isNotPending = $derived(
    !!workflow && !workflow.isRunning && !workflow.isPaused,
  );

  let groups = $derived(
    reverseSort ? [...filteredGroups].reverse() : filteredGroups,
  );
  let history = $derived(
    reverseSort ? [...filteredEvents].reverse() : filteredEvents,
  );

  let items = $derived(
    (compact
      ? orderGroupsByPending(groups, reverseSort)
      : reverseSort
        ? [...pendingNexusOperations, ...pendingActivities, ...history]
        : [...history, ...pendingActivities, ...pendingNexusOperations]) as
      | EventGroups
      | IterableEventWithPending[],
  );

  $effect(() => {
    $eventViewType;
    clearActives();
  });

  beforeNavigate(() => {
    clearActives();
  });

  $effect(() => {
    if (isNotPending && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  });

  let showDownloadPrompt = $state(false);

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams(page.url, { sort: newSort }, goto);
  };

  const onAutoRefreshToggle = () => {
    updateEventFilterParams(
      page.url,
      { refresh_off: !$pauseLiveUpdates },
      goto,
    );
  };

  const onAllClick = () => {
    $eventViewType = 'feed';
  };

  const onCompactClick = () => {
    $eventViewType = 'compact';
  };

  const onJSONClick = () => {
    $eventViewType = 'json';
  };

  const liveUpdatesOn = $derived(!$pauseLiveUpdates && !isNotPending);

  const viewModes = $derived<FilterView[]>([
    {
      id: 'feed',
      label: translate('common.all'),
      icon: 'feed',
      active: $eventViewType === 'feed',
      onSelect: onAllClick,
    },
    {
      id: 'compact',
      label: translate('events.legend-filter.view-compact'),
      icon: 'compact',
      active: compact,
      onSelect: onCompactClick,
    },
    {
      id: 'json',
      label: translate('events.legend-filter.view-json'),
      icon: 'json',
      active: $eventViewType === 'json',
      onSelect: onJSONClick,
    },
  ]);

  const viewToggles = $derived<FilterToggle[]>([
    {
      id: 'history-auto-refresh',
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
    ...($eventViewType === 'json'
      ? []
      : [
          {
            id: 'history-sort-direction',
            label: reverseSort
              ? translate('common.descending')
              : translate('common.ascending'),
            icon: reverseSort ? 'descending' : 'ascending',
            onClick: onSort,
          } as FilterAction,
        ]),
    {
      id: 'history-download',
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
<div class="relative">
  <div
    class="surface-background sticky top-0 z-[11] border-b border-subtle pb-2 md:top-[var(--top-nav-height)] md:pt-2"
  >
    <h2>
      {translate('workflows.history-tab')}
    </h2>
    <EventFilter
      groups={bufferGroups}
      facets={$eventViewType === 'json'
        ? ['event-type']
        : ['event-type', 'refine']}
      refineOptions={['pending']}
      counts={panelCounts}
      {compact}
      toggles={viewToggles}
      actions={viewActions}
      views={viewModes}
    />
  </div>
  <div class="flex w-full flex-col">
    {#if $eventViewType === 'json'}
      <div class="border-t border-subtle px-4">
        <WorkflowHistoryJson events={filteredEvents} />
      </div>
    {:else}
      <div data-testid="event-summary-table">
        <EventSummaryTable {updating} {items} {groups} {compact} {groupIndex} />
      </div>
    {/if}
  </div>
</div>
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow?.id ?? ''}
  runId={workflow?.runId ?? ''}
/>
