<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import CommandRail from '$lib/holocene/command-rail.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { isCategoryType } from '$lib/models/event-history/get-event-categorization';
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
  import { eventCategoryFilter, eventTypeFilter } from '$lib/stores/filters';
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

  const filteredGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    const cats = $eventCategoryFilter;
    return bufferGroups.filter((g) => {
      if (!active.includes(g.category)) return false;
      if (cats && cats.length && !cats.includes(g.category)) return false;
      return true;
    });
  });

  const filteredEvents = $derived.by(() => {
    const active = $eventTypeFilter;
    const cats = $eventCategoryFilter;
    return bufferEvents.filter((ev) => {
      const cat = (ev as WorkflowEvent).category;
      if (!active.includes(cat)) return false;
      if (cats && cats.length && !cats.includes(cat)) return false;
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
    class="surface-background sticky top-[var(--target-size)] z-sticky flex h-target min-w-0 items-center gap-3 border-b border-subtle md:top-[calc(var(--top-nav-height)+var(--control-height-sm))] md:h-[calc(var(--control-height-sm)+0.5rem)]"
  >
    <h2 class="shrink-0">
      {translate('workflows.history-tab')}
    </h2>
    <CommandRail
      label={translate('workflows.event-history-controls')}
      role="group"
      class="h-full min-w-0 flex-1"
      viewportClass="flex h-full items-center gap-3"
      id="event-history-command-rail-viewport"
      data-testid="event-history-command-rail"
    >
      <TabButtons class="relative shrink-0">
        <TabButton
          active={$eventViewType === 'feed'}
          data-testid="feed"
          icon="feed"
          showLabelOnSmallScreens
          onclick={onAllClick}>All</TabButton
        >
        <TabButton
          active={$eventViewType === 'compact'}
          data-testid="compact"
          icon="compact"
          showLabelOnSmallScreens
          onclick={onCompactClick}>Compact</TabButton
        >
        <TabButton
          active={$eventViewType === 'json'}
          data-testid="json"
          icon="json"
          showLabelOnSmallScreens
          onclick={onJSONClick}>JSON</TabButton
        >
      </TabButtons>
      <ToggleButtons class="ml-auto shrink-0">
        {#if $eventViewType !== 'json'}
          <ToggleButton
            leadingIcon={reverseSort ? 'descending' : 'ascending'}
            data-testid="zoom-in"
            onclick={onSort}
            size="sm"
            showLabelOnSmallScreens
          >
            {reverseSort
              ? translate('common.descending')
              : translate('common.ascending')}
          </ToggleButton>
        {/if}
        <EventTypeFilter {compact} showLabelOnSmallScreens />
        <ToggleButton
          disabled={isNotPending}
          active={!$pauseLiveUpdates && !isNotPending}
          aria-label={$pauseLiveUpdates || isNotPending
            ? translate('workflows.auto-refresh-off')
            : translate('workflows.auto-refresh-on')}
          data-testid="pause"
          class="border-l-0"
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
  <div class="flex w-full flex-col">
    {#if $eventViewType === 'json'}
      <div class="border-t border-subtle">
        <WorkflowHistoryJson events={filteredEvents} />
      </div>
    {:else}
      <div data-testid="event-summary-table">
        <EventSummaryTable {updating} {items} {groups} {compact} />
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
