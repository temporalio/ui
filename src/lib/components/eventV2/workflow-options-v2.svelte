<script lang="ts">
  import { page } from '$app/stores';
  import Accordion from '$lib/holocene/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { exportHistory } from '$lib/utilities/export-history';
  import EventDateFilter from '../event/event-date-filter.svelte';

  export let showWorkflowTasks = false;
  export let showNonCompleted = false;
  export let onDebugClick: () => void;
  export let onAdvancedClick: () => void;
</script>

<section>
  <Accordion title="Options" icon="settings" readOnly stackSummary>
    <div slot="summary" class="flex flex-col gap-4">
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
      <div class="flex flex-row items-center gap-4">
        <label
          for="non-completed-tasks"
          class="flex items-center gap-2 text-center font-secondary text-sm"
          >Show non-completed events only
          <ToggleSwitch
            id="non-completed-tasks"
            checked={showNonCompleted}
            on:change={onDebugClick}
          />
        </label>
        <label
          for="workflow-tasks"
          class="flex items-center gap-2 text-center font-secondary text-sm"
          >Show Workflow Tasks
          <ToggleSwitch
            id="workflow-tasks"
            checked={showWorkflowTasks}
            on:change={onAdvancedClick}
          />
        </label>
      </div>
    </div>
  </Accordion>
</section>
