<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/state';

  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { currentEventHistory, pauseLiveUpdates } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  let { children, title }: { children: Snippet; title: Snippet } = $props();

  const workflow = $derived($workflowRun.workflow);
  const reverseSort = $derived($eventFilterSort === 'descending');
  const compact = $derived($eventViewType === 'compact');
  const historyTablePage = $derived(page.url.pathname.endsWith('history'));
  const workflowTaskFailedError = $derived(
    getWorkflowTaskFailedEvent($currentEventHistory, 'ascending'),
  );

  beforeNavigate(() => {
    clearActives();
  });

  $effect(() => {
    eventViewType;
    clearActives();
  });

  $effect(() => {
    if (!workflow.isRunning && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  });

  const onSort = () => {
    if (reverseSort) {
      $eventFilterSort = 'ascending';
    } else {
      $eventFilterSort = 'descending';
    }
  };
</script>

<div class="flex flex-col gap-2">
  <InputAndResults />
  <WorkflowCallStackError />
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
<div class="relative pb-24">
  <div
    class={merge(
      'surface-background sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 py-2 md:top-12 xl:gap-8',
      !historyTablePage && 'border-b border-subtle',
    )}
  >
    {@render title()}
    <div class="flex items-center gap-2">
      <ToggleButtons>
        {#if $eventViewType !== 'json'}
          <ToggleButton
            leadingIcon={reverseSort ? 'descending' : 'ascending'}
            data-testid="zoom-in"
            on:click={onSort}
            size="sm">{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
          >
        {/if}
        <EventTypeFilter {compact} />
        <ToggleButton
          disabled={!workflow.isRunning}
          leadingIcon={$pauseLiveUpdates ? 'play' : 'pause'}
          data-testid="pause"
          class="border-l-0"
          size="sm"
          on:click={() => ($pauseLiveUpdates = !$pauseLiveUpdates)}
        >
          {$pauseLiveUpdates ? 'Unfreeze' : 'Freeze'}
        </ToggleButton>
      </ToggleButtons>
      {#if historyTablePage}
        <ToggleButtons>
          <ToggleButton
            active={$eventViewType === 'feed'}
            data-testid="feed"
            leadingIcon="feed"
            size="sm"
            on:click={() => ($eventViewType = 'feed')}>All</ToggleButton
          >
          <ToggleButton
            active={compact}
            data-testid="compact"
            leadingIcon="compact"
            size="sm"
            on:click={() => ($eventViewType = 'compact')}>Compact</ToggleButton
          >
          <ToggleButton
            active={$eventViewType === 'json'}
            data-testid="json"
            leadingIcon="json"
            size="sm"
            on:click={() => ($eventViewType = 'json')}>JSON</ToggleButton
          >
        </ToggleButtons>
      {/if}
    </div>
  </div>
  {@render children()}
</div>
