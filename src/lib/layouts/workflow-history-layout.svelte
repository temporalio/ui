<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { isCategoryType } from '$lib/models/event-history/get-event-categorization';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import { clearActives } from '$lib/stores/active-events';
  import {
    eventFilterSort,
    eventViewType,
    minimizeEventView,
  } from '$lib/stores/event-view';
  import {
    filteredEventHistory,
    fullEventHistory,
    pauseLiveUpdates,
  } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { IterableEventWithPending } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';

  const { namespace } = $derived(page.params);
  const { workflow } = $derived($workflowRun);
  const pendingActivities = $derived(workflow?.pendingActivities ?? []);
  const pendingNexusOperations = $derived(
    workflow?.pendingNexusOperations ?? [],
  );

  $effect(() => {
    const urlParams = parseEventFilterParams(page.url);
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.frozen;
  });

  $effect(() => {
    const category = page.url?.searchParams?.get('category');
    $eventCategoryFilter = category
      ? category.split(',').filter(isCategoryType)
      : undefined;
  });

  let reverseSort = $derived($eventFilterSort === 'descending');
  let compact = $derived($eventViewType === 'compact');
  let updating = $derived(!$fullEventHistory.length);

  let ascendingGroups = $derived(
    groupEvents(
      $filteredEventHistory,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );

  let groups = $derived(
    reverseSort ? [...ascendingGroups].reverse() : ascendingGroups,
  );
  let history = $derived(
    reverseSort ? [...$filteredEventHistory].reverse() : $filteredEventHistory,
  );

  let items = $derived(
    (compact
      ? groups
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
    if (!workflow?.isRunning && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  });

  let showDownloadPrompt = $state(false);

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams(page.url, { sort: newSort }, goto);
  };

  const onFreezeToggle = () => {
    updateEventFilterParams(page.url, { frozen: !$pauseLiveUpdates }, goto);
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
<div class="relative">
  <div
    class={merge(
      'surface-background flex flex-wrap items-center justify-between gap-2 border-b border-subtle xl:gap-8',
      !$minimizeEventView && 'sticky top-0 z-30 md:top-12',
    )}
  >
    <div class="items-bottom flex gap-4">
      <h2>
        {translate('workflows.history-tab')}
      </h2>
      <TabButtons class="relative top-[2px]">
        <TabButton
          active={$eventViewType === 'feed'}
          data-testid="feed"
          icon="feed"
          class="h-10"
          on:click={onAllClick}>All</TabButton
        >
        <TabButton
          active={$eventViewType === 'compact'}
          data-testid="compact"
          icon="compact"
          class="h-10"
          on:click={onCompactClick}>Compact</TabButton
        >
        <TabButton
          active={$eventViewType === 'json'}
          data-testid="json"
          icon="json"
          class="h-10"
          on:click={onJSONClick}>JSON</TabButton
        >
      </TabButtons>
    </div>
    <div class="flex items-center gap-2 pb-2">
      <ToggleButtons>
        {#if $eventViewType !== 'json'}
          <ToggleButton
            leadingIcon={reverseSort ? 'descending' : 'ascending'}
            data-testid="zoom-in"
            on:click={onSort}
            size="sm"
          >
            {reverseSort
              ? translate('common.descending')
              : translate('common.ascending')}
          </ToggleButton>
        {/if}
        <EventTypeFilter {compact} minimized={$minimizeEventView} />
        <ToggleButton
          disabled={!workflow?.isRunning}
          data-testid="pause"
          class="border-l-0"
          size="sm"
          on:click={onFreezeToggle}
        >
          <span
            class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates ||
            !workflow?.isRunning
              ? 'bg-slate-300'
              : 'bg-green-600'}"
          ></span>
          {$pauseLiveUpdates || !workflow?.isRunning
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
  <div class="flex w-full flex-col">
    {#if $eventViewType === 'json'}
      <div class="border-t border-subtle px-4">
        <WorkflowHistoryJson />
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
  workflowId={workflow?.id}
  runId={workflow?.runId}
/>
