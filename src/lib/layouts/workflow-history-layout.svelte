<script lang="ts">
  import { page } from '$app/stores';

  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import EventShortcutKeys from '$lib/components/event/event-shortcut-keys.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import WorkflowStackTraceError from '$lib/components/workflow/workflow-stack-trace-error.svelte';
  import WorkflowSummary from '$lib/components/workflow/workflow-summary.svelte';
  import WorkflowTypedError from '$lib/components/workflow/workflow-typed-error.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { authUser } from '$lib/stores/auth-user';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { eventViewType } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { timeline } from '$lib/stores/timeline';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { EventView } from '$lib/types/events';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { exportHistory } from '$lib/utilities/export-history';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

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
  $: compact = $eventViewType === 'compact';
  $: json = $eventViewType === 'json';

  const onViewClick = (view: EventView) => {
    if ($page.url.searchParams.get('page')) {
      $page.url.searchParams.delete('page');
    }
    $eventViewType = view;
  };

  $: expandAll = $expandAllEvents === 'true';

  function handleChange() {
    if ($expandAllEvents === 'true') {
      $expandAllEvents = 'false';
    } else {
      $expandAllEvents = 'true';
    }
  }
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
  <section id="event-history">
    <nav
      class="flex flex-col items-center justify-between gap-4 lg:flex-row lg:items-end"
      aria-label={translate('workflows', 'recent-events-view')}
    >
      <div class="flex w-full gap-2">
        <h2 class="text-xl font-medium">
          {translate('workflows', 'event-history')}
        </h2>
        <IconButton
          label="download"
          icon="download"
          data-testid="download"
          on:click={() =>
            exportHistory({
              namespace: decodeURIForSvelte($page.params.namespace),
              workflowId: decodeURIForSvelte($workflowRun.workflow?.id),
              runId: decodeURIForSvelte($workflowRun.workflow?.runId),
              settings: $page.data.settings,
              accessToken: $authUser?.accessToken,
            })}
        />
      </div>
      {#if !json}
        <div class="flex w-full justify-end">
          <div class="flex items-center justify-end gap-2 py-1">
            <div class="flex flex-col gap-2 md:flex-row">
              <div class="flex gap-2">
                <EventDateFilter {compact} />
                <EventCategoryFilter {compact} />
                <Button
                  variant="secondary"
                  trailingIcon={expandAll ? 'chevron-up' : 'chevron-down'}
                  on:click={handleChange}
                >
                  <span class="hidden sm:block">
                    {expandAll
                      ? translate('collapse-all')
                      : translate('expand-all')}
                  </span>
                </Button>
                <ToggleButtons>
                  <ToggleButton
                    data-testid="zoom-in"
                    on:click={() => $timeline.zoomIn(1)}>+</ToggleButton
                  >
                  <ToggleButton
                    data-testid="zoom-in"
                    on:click={() => $timeline.zoomOut(1)}>-</ToggleButton
                  >
                  <ToggleButton
                    data-testid="zoom-in"
                    on:click={() => $timeline.focus('workflow')}
                    >Fit</ToggleButton
                  >
                </ToggleButtons>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </nav>
    <div class="mt-4 flex">
      <ToggleButtons class="z-40 -mb-10 w-full bg-gray-100">
        <ToggleButton
          icon="feed"
          class="w-1/3 !rounded-bl-none"
          active={$eventViewType === 'feed'}
          data-testid="feed"
          on:click={() => onViewClick('feed')}
          >{translate('workflows', 'history')}</ToggleButton
        >
        <ToggleButton
          icon="compact"
          class="w-1/3"
          active={compact}
          data-testid="compact"
          on:click={() => onViewClick('compact')}
          >{translate('workflows', 'compact')}</ToggleButton
        >
        <ToggleButton
          icon="json"
          class="w-1/3 !rounded-br-none"
          active={$eventViewType === 'json'}
          data-testid="json"
          on:click={() => onViewClick('json')}
          >{translate('workflows', 'json')}</ToggleButton
        >
      </ToggleButtons>
    </div>
    <slot />
  </section>
  <EventShortcutKeys
    open={showShortcuts}
    onOpen={() => (showShortcuts = true)}
    onClose={() => (showShortcuts = false)}
  />
</div>
