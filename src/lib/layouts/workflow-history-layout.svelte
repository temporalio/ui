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
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconArrowAscending,
    IconArrowDescending,
    IconCode,
    IconCompact,
    IconDownload,
    IconFeed,
  } from '$lib/io/icon';
  import { isCategoryType } from '$lib/models/event-history/get-event-categorization';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import { eventBuffer } from '$lib/services/grouped-event-buffer.svelte';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { pauseLiveUpdates } from '$lib/stores/events';
  import { eventCategoryFilter, eventTypeFilter } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
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

  // Enough to filter, sort and paginate; only the rendered page is materialized.
  // The feed view needs full groups, read lazily in tableProps below.
  const bufferLazyGroups = $derived(eventBuffer.lazyGroupsWithoutWorkflowTasks);
  const bufferEvents = $derived(eventBuffer.events);
  let updating = $derived(!historyCtx.fetchComplete);

  onMount(() => {
    historyCtx.resume();
  });

  const filteredLazyGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    const cats = $eventCategoryFilter;
    return bufferLazyGroups.filter((g) => {
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
    if (!historyCtx.fetchComplete) return undefined;
    return eventBuffer.workflowTaskFailedEvent as
      | WorkflowTaskFailedEvent
      | WorkflowTaskTimedOutEvent
      | undefined;
  });

  const isNotPending = $derived(
    !!workflow && !workflow.isRunning && !workflow.isPaused,
  );

  let lazyGroups = $derived(
    reverseSort ? filteredLazyGroups.toReversed() : filteredLazyGroups,
  );
  let history = $derived(
    reverseSort ? filteredEvents.toReversed() : filteredEvents,
  );

  // EventSummaryTable's props are a union on `compact`, so the pair travels as
  // one object. Keeps the materialized groups on the feed branch too.
  const tableProps = $derived(
    compact
      ? {
          compact: true as const,
          items: orderGroupsByPending(lazyGroups, reverseSort),
        }
      : {
          compact: false as const,
          items: reverseSort
            ? [...pendingNexusOperations, ...pendingActivities, ...history]
            : [...history, ...pendingActivities, ...pendingNexusOperations],
          groups: eventBuffer.groupsWithoutWorkflowTasks,
        },
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
    class="surface-background sticky top-0 z-[11] flex flex-wrap items-center justify-between gap-2 border-b border-subtle md:top-[var(--top-nav-height)] md:pt-2 xl:gap-8"
  >
    <div class="items-bottom flex gap-4 pt-2">
      <h2>
        {translate('workflows.history-tab')}
      </h2>
      <TabButtons class="relative">
        <TabButton
          active={$eventViewType === 'feed'}
          data-testid="feed"
          Icon={IconFeed}
          class="h-10"
          onclick={onAllClick}>All</TabButton
        >
        <TabButton
          active={$eventViewType === 'compact'}
          data-testid="compact"
          Icon={IconCompact}
          class="h-10"
          onclick={onCompactClick}>Compact</TabButton
        >
        <TabButton
          active={$eventViewType === 'json'}
          data-testid="json"
          Icon={IconCode}
          class="h-10"
          onclick={onJSONClick}>JSON</TabButton
        >
      </TabButtons>
    </div>
    <div class="flex items-center gap-2 pb-2">
      <ToggleButtons>
        {#if $eventViewType !== 'json'}
          <ToggleButton
            LeadingIcon={reverseSort ? IconArrowDescending : IconArrowAscending}
            data-testid="zoom-in"
            onclick={onSort}
            size="sm"
          >
            {reverseSort
              ? translate('common.descending')
              : translate('common.ascending')}
          </ToggleButton>
        {/if}
        <EventTypeFilter {compact} />
        <ToggleButton
          disabled={isNotPending}
          data-testid="pause"
          class="border-l-0"
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
  <div class="flex w-full flex-col">
    {#if $eventViewType === 'json'}
      <div class="border-t border-subtle px-4">
        <WorkflowHistoryJson events={filteredEvents} />
      </div>
    {:else}
      <div data-testid="event-summary-table">
        <EventSummaryTable {updating} {...tableProps} />
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
