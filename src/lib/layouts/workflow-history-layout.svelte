<script lang="ts">
  import { page } from '$app/stores';

  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import EventShortcutKeys from '$lib/components/event/event-shortcut-keys.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import WorkflowStackTraceError from '$lib/components/workflow/workflow-stack-trace-error.svelte';
  import WorkflowSummary from '$lib/components/workflow/workflow-summary.svelte';
  import WorkflowTypedError from '$lib/components/workflow/workflow-typed-error.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllEvents } from '$lib/services/events-service';
  import {
    eventFilterSort,
    type EventSortOrder,
    eventViewType,
  } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';
  import type { EventView } from '$lib/types/events';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { exportHistory } from '$lib/utilities/export-history';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  let showShortcuts = false;
  let showDownloadPrompt = false;
  let decodeEventHistory = true;

  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($eventHistory);
  $: ({ workflow } = $workflowRun);
  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $eventHistory,
    $fullEventHistory,
    $namespaces,
  );
  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $fullEventHistory,
    $eventFilterSort,
  );

  const resetFullHistory = () => {
    $fullEventHistory = [];
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
    view: EventView,
    sort: EventSortOrder,
  ) => {
    resetFullHistory();
    $fullEventHistory = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      sort: view === 'feed' ? sort : 'ascending',
    });
  };

  $: $refresh,
    fetchEvents(namespace, workflowId, runId, $eventViewType, $eventFilterSort);

  const onViewClick = (view: EventView) => {
    if ($page.url.searchParams.get('page')) {
      $page.url.searchParams.delete('page');
    }
    $eventViewType = view;
  };

  const onDownloadClick = () => {
    showDownloadPrompt = false;
    exportHistory({
      namespace: decodeURIForSvelte($page.params.namespace),
      workflowId: decodeURIForSvelte($workflowRun.workflow?.id),
      runId: decodeURIForSvelte($workflowRun.workflow?.runId),
      settings: $page.data.settings,
      decodeEventHistory,
    });
  };
</script>

<div class="flex flex-col gap-2">
  <WorkflowStackTraceError />
  {#if workflowTaskFailedError}
    <WorkflowTypedError error={workflowTaskFailedError} />
  {/if}
  <WorkflowSummary />
  <WorkflowRelationships {...workflowRelationships} />
  <PendingActivities />
  <section>
    <Accordion
      title={workflowEvents.contAsNew
        ? translate('workflows.input')
        : translate('workflows.input-and-results')}
      icon="json"
      class="border-gray-900"
      data-testid="input-and-results"
    >
      <div class="flex w-full flex-col gap-2 lg:flex-row">
        <InputAndResults
          title="Input"
          content={workflowEvents.input}
          data-testid="workflow-input"
        />
        <InputAndResults
          content={workflowEvents.results}
          title={workflowEvents.contAsNew
            ? translate('workflows.continued-as-new-with-input')
            : translate('workflows.results')}
          data-testid="workflow-results"
        />
      </div>
    </Accordion>
  </section>
  <EventHistoryTimeline history={$fullEventHistory} />
  <section id="event-history">
    <nav
      class="flex flex-col items-center justify-between gap-4 lg:flex-row lg:items-end"
      aria-label={translate('workflows.event-history-view')}
    >
      <h2 class="text-2xl font-medium">
        {translate('workflows.event-history')}
      </h2>
      <div id="event-view-toggle" class="mt-4 flex gap-4 bg-white">
        <ToggleButtons>
          <ToggleButton
            icon="feed"
            active={$eventViewType === 'feed'}
            data-testid="feed"
            on:click={() => onViewClick('feed')}
            >{translate('workflows.history')}</ToggleButton
          >
          <ToggleButton
            icon="compact"
            active={$eventViewType === 'compact'}
            data-testid="compact"
            on:click={() => onViewClick('compact')}
            >{translate('workflows.compact')}</ToggleButton
          >
          <ToggleButton
            icon="json"
            active={$eventViewType === 'json'}
            data-testid="json"
            on:click={() => onViewClick('json')}
            >{translate('workflows.json')}</ToggleButton
          >
          <ToggleButton
            icon="download"
            data-testid="download"
            on:click={() => (showDownloadPrompt = true)}
            >{translate('workflows.download')}</ToggleButton
          >
        </ToggleButtons>
      </div>
    </nav>
    <slot />
  </section>
  <EventShortcutKeys
    open={showShortcuts}
    onOpen={() => (showShortcuts = true)}
    onClose={() => (showShortcuts = false)}
  />
</div>

<Modal
  id="download-history"
  large
  bind:open={showDownloadPrompt}
  confirmType="primary"
  confirmText={translate('common.download')}
  cancelText={translate('common.cancel')}
  on:confirmModal={() => onDownloadClick()}
  on:cancelModal={() => (showDownloadPrompt = false)}
>
  <h3 slot="title">
    {translate('common.download-json')}
  </h3>
  <div slot="content" class="flex flex-col gap-4">
    <ToggleSwitch
      label={translate('events.decode-event-history')}
      id="decode-event-history"
      bind:checked={decodeEventHistory}
      data-testid="decode-event-history-toggle"
    />
  </div>
</Modal>
