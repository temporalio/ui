<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';

  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { filteredEventHistory, pauseLiveUpdates } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: pendingNexusOperations = workflow?.pendingNexusOperations;

  $: urlParams = parseEventFilterParams($page.url);
  $: {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.frozen;
  }

  $: reverseSort = $eventFilterSort === 'descending';

  $: ascendingGroups = groupEvents(
    $filteredEventHistory,
    'ascending',
    pendingActivities,
    pendingNexusOperations,
  );

  $: groups = reverseSort ? [...ascendingGroups].reverse() : ascendingGroups;

  beforeNavigate(() => {
    clearActives();
  });

  $: {
    if (!workflow.isRunning && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  }

  let showDownloadPrompt = false;

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams($page.url, { sort: newSort }, goto);
  };

  const onFreezeToggle = () => {
    updateEventFilterParams($page.url, { frozen: !$pauseLiveUpdates }, goto);
  };
</script>

<InputAndResults />
<div class="relative pb-24">
  <div
    class="surface-background sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-2 md:top-12 xl:gap-8"
  >
    <h2>
      {translate('workflows.timeline-tab')}
    </h2>
    <div class="flex items-center gap-2">
      <ToggleButtons>
        <ToggleButton
          leadingIcon={reverseSort ? 'descending' : 'ascending'}
          data-testid="zoom-in"
          on:click={onSort}
          size="sm">{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
        >
        <EventTypeFilter compact={false} minimized={false} />
        <ToggleButton
          disabled={!workflow.isRunning}
          leadingIcon={$pauseLiveUpdates ? 'play' : 'pause'}
          data-testid="pause"
          class="border-l-0"
          size="sm"
          on:click={onFreezeToggle}
        >
          {$pauseLiveUpdates ? 'Unfreeze' : 'Freeze'}
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
    <TimelineGraph {workflow} {groups} viewportHeight={undefined} />
  </div>
</div>
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
