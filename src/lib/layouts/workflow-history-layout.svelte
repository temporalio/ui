<script lang="ts">
  import { page } from '$app/stores';
  import { eventViewType } from '$lib/stores/event-view';
  import {
    getWorkflowStartedCompletedAndTaskFailedEvents,
    isCompletionEvent,
  } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import { exportHistory } from '$lib/utilities/export-history';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';

  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import WorkflowStackTraceError from '$lib/components/workflow/workflow-stack-trace-error.svelte';
  import WorkflowSummary from '$lib/components/workflow/workflow-summary.svelte';
  import WorkflowTypedError from '$lib/components/workflow/workflow-typed-error.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import EventShortcutKeys from '$lib/components/event/event-shortcut-keys.svelte';

  import type { CommonHistoryEvent, EventView } from '$lib/types/events';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { authUser } from '$lib/stores/auth-user';
  import EventSummaryTimeline from '$lib/components/eventV2/event-summary-timeline.svelte';
  import { noop, onDestroy } from 'svelte/internal';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { toEventHistory } from '$lib/models/event-history';
  import debounce from 'just-debounce';
  import { refresh } from '$lib/stores/workflows';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';

  let showShortcuts = false;
  let controller;

  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($eventHistory);
  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: ({ workflow } = $workflowRun);

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $eventHistory,
    fullHistory,
    $namespaces,
  );

  let fullHistory: CommonHistoryEvent[] = [];

  const onViewClick = (view: EventView) => {
    if ($page.url.searchParams.get('page')) {
      $page.url.searchParams.delete('page');
    }
    $eventViewType = view;
  };

  const setFullHistory = async (events) => {
    const { settings } = $page.data;
    const newHistory = await toEventHistory({
      response: events.slice(fullHistory.length),
      namespace,
      settings,
      accessToken: $authUser?.accessToken,
    });
    $fullEventHistory = [...$fullEventHistory, ...newHistory];
    const lastEvent = events[events.length - 1];
    if (isCompletionEvent(lastEvent)) {
      $refresh = Date.now();
    }
  };

  const debounceSetFullHistory = debounce(async (events) => {
    setFullHistory(events);
  }, 250);

  const onUpdate = async ({ history }) => {
    const { events } = history;
    if (!$fullEventHistory.length && events.length) {
      setFullHistory(events);
    } else if (events.length > $fullEventHistory.length) {
      debounceSetFullHistory(events);
    }
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    controller = new AbortController();
    const signal = controller.signal;
    const { settings } = $page.data;
    fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      params: { waitNewEvent: 'true' },
      accessToken: $authUser?.accessToken,
      sort: 'ascending',
      onUpdate,
      signal,
    });
  };

  $: fetchEvents(namespace, workflowId, runId);

  onDestroy(() => {
    controller.abort();
  });
</script>

<div class="flex flex-col gap-4">
  <WorkflowStackTraceError />
  <WorkflowTypedError error={workflowEvents.error} />
  <WorkflowSummary />
  <WorkflowRelationships {...workflowRelationships} />
  <PendingActivities />
  <section>
    <Accordion
      title={workflowEvents.contAsNew ? 'Input' : 'Input and Results'}
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
            ? 'Continued as New with Input'
            : 'Results'}
          data-testid="workflow-results"
        />
      </div>
    </Accordion>
  </section>
  <LabsModeGuard>
    <EventSummaryTimeline
      slot="labs"
      fullHistory={$fullEventHistory}
      onShowCompletedToggle={noop}
    />
  </LabsModeGuard>
  <section id="event-history">
    <nav
      class="flex flex-col items-center justify-between gap-4 pb-4 lg:flex-row lg:items-end"
      aria-label="recent events view"
    >
      <h2 class="text-lg font-medium">Recent Events</h2>
      <div id="event-view-toggle" class="flex gap-4 bg-white">
        <ToggleButtons>
          <ToggleButton
            icon="feed"
            active={$eventViewType === 'feed'}
            data-testid="feed"
            on:click={() => onViewClick('feed')}>History</ToggleButton
          >
          <ToggleButton
            icon="compact"
            active={$eventViewType === 'compact'}
            data-testid="compact"
            on:click={() => onViewClick('compact')}>Compact</ToggleButton
          >
          <ToggleButton
            icon="json"
            active={$eventViewType === 'json'}
            data-testid="json"
            on:click={() => onViewClick('json')}>JSON</ToggleButton
          >
          <ToggleButton
            icon="download"
            data-testid="download"
            on:click={() =>
              exportHistory({
                namespace: decodeURIForSvelte($page.params.namespace),
                workflowId: decodeURIForSvelte($workflowRun.workflow?.id),
                runId: decodeURIForSvelte($workflowRun.workflow?.runId),
                settings: $page.data.settings,
                accessToken: $authUser?.accessToken,
              })}>Download</ToggleButton
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
