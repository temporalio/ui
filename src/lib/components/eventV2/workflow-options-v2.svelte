<script lang="ts">
  import { page } from '$app/stores';
  import Accordion from '$lib/holocene/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import RangeInput from '$lib/holocene/input/range-input.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { exportHistory } from '$lib/utilities/export-history';
  import EventDateFilter from '../event/event-date-filter.svelte';

  export let showWorkflowTasks = false;
  export let showNonCompleted = false;
  export let showStackTrace = false;
  export let stackTrace: string;
  export let timeTravelPosition = 1;
  export let maxTimeTravel = 1;
  export let onDebugClick: () => void;
  export let onAdvancedClick: () => void;
  export let onShowStackTrace: () => void;
</script>

<section>
  <Accordion title="Options" icon="settings" readOnly stackSummary>
    <div slot="summary" class="flex flex-col gap-4 w-full">
      <div class="flex flex-row items-center gap-4">
        <Button variant="secondary">
          <EventDateFilter compact={false} hideSort />
        </Button>
        <Button
          icon="download"
          data-testid="download"
          on:click={() =>
            exportHistory({
              namespace: $page.params.namespace,
              workflowId: $workflowRun.workflow?.id,
              runId: $workflowRun.workflow?.runId,
            })}>Download</Button
        >
      </div>
      <div class="flex flex-col items-start gap-4">
        <label
          for="non-completed-tasks"
          class="flex items-center gap-2 text-center font-secondary text-sm"
        >
          <ToggleSwitch
            id="non-completed-tasks"
            checked={showNonCompleted}
            on:change={onDebugClick}
          />Debug Mode
        </label>
        <label
          for="stack-trace"
          class="flex items-center gap-2 text-center font-secondary text-sm"
        >
          <ToggleSwitch
            id="stack-trace"
            checked={showStackTrace}
            on:change={onShowStackTrace}
          />Stack Trace Mode
        </label>
        <label
          for="workflow-tasks"
          class="flex items-center gap-2 text-center font-secondary text-sm"
        >
          <ToggleSwitch
            id="workflow-tasks"
            checked={showWorkflowTasks}
            on:change={onAdvancedClick}
          />Workflow Task Mode
        </label>
        {#if showStackTrace}
          <RangeInput
            id="time-travel-range"
            min={1}
            max={maxTimeTravel}
            bind:value={timeTravelPosition}
            showInput={false}
          />
        {/if}
      </div>
    </div>
  </Accordion>
</section>
