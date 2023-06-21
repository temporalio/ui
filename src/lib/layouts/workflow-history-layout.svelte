<script lang="ts">
  import { page } from '$app/stores';
  import { eventViewType } from '$lib/stores/event-view';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
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
  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';

  import type { EventView } from '$lib/types/events';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { authUser } from '$lib/stores/auth-user';
  import { translate } from '$lib/i18n/translate';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';

  let showShortcuts = false;

  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($eventHistory);
  $: ({ workflow } = $workflowRun);
  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $eventHistory,
    $fullEventHistory,
    $namespaces,
  );

  const onViewClick = (view: EventView) => {
    if ($page.url.searchParams.get('page')) {
      $page.url.searchParams.delete('page');
    }
    $eventViewType = view;
  };
</script>

<div class="flex flex-col gap-4">
  <WorkflowStackTraceError />
  {#if workflowEvents.error}
    <WorkflowTypedError error={workflowEvents.error} />
  {/if}
  <WorkflowSummary />
  <WorkflowRelationships {...workflowRelationships} />
  <PendingActivities />
  <section>
    <Accordion
      title={workflowEvents.contAsNew
        ? translate('workflows', 'input')
        : translate('workflows', 'input-and-results')}
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
            ? translate('workflows', 'continued-as-new-with-input')
            : translate('workflows', 'results')}
          data-testid="workflow-results"
        />
      </div>
    </Accordion>
  </section>
  <LabsModeGuard>
    <EventHistoryTimeline history={$fullEventHistory} />
  </LabsModeGuard>
  <section id="event-history">
    <nav
      class="flex flex-col items-center justify-between gap-4 pb-4 lg:flex-row lg:items-end"
      aria-label="recent events view"
    >
      <h2 class="text-lg font-medium">
        {translate('workflows', 'recent-events')}
      </h2>
      <div id="event-view-toggle" class="flex gap-4 bg-white">
        <ToggleButtons>
          <ToggleButton
            icon="feed"
            active={$eventViewType === 'feed'}
            data-testid="feed"
            on:click={() => onViewClick('feed')}
            >{translate('workflows', 'history')}</ToggleButton
          >
          <ToggleButton
            icon="compact"
            active={$eventViewType === 'compact'}
            data-testid="compact"
            on:click={() => onViewClick('compact')}
            >{translate('workflows', 'compact')}</ToggleButton
          >
          <ToggleButton
            icon="json"
            active={$eventViewType === 'json'}
            data-testid="json"
            on:click={() => onViewClick('json')}
            >{translate('workflows', 'json')}</ToggleButton
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
              })}>{translate('workflows', 'download')}</ToggleButton
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
