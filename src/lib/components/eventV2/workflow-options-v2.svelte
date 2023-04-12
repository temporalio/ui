<script lang="ts">
  import { page } from '$app/stores';
  import Accordion from '$lib/holocene/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { exportHistory } from '$lib/utilities/export-history';
  import EventDateFilter from '../event/event-date-filter.svelte';

  export let showWorkflowTasks = false;
  export let expandAll = false;
  export let showNonCompleted = false;
  export let onExpandClick: () => void;
  export let onAdvancedClick: () => void;
</script>

<div class="flex flex-row gap-4 items-center justify-end mb-4">
  <label
    for="workflow-tasks"
    class="flex items-center gap-2 text-center font-secondary text-sm"
    >Show All Events
    <ToggleSwitch
      id="workflow-tasks"
      checked={showWorkflowTasks}
      on:change={onAdvancedClick}
    />
  </label>
  <label
    for="expand-all"
    class="flex items-center gap-2 text-center font-secondary text-sm"
    >Expand All
    <ToggleSwitch
      id="expand-all"
      checked={expandAll}
      on:change={onExpandClick}
    />
  </label>
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
