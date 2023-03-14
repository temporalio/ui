<script lang="ts">
  import { page } from '$app/stores';
  import Accordion from '$lib/holocene/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { exportHistory } from '$lib/utilities/export-history';
  import EventDateFilter from '../event/event-date-filter.svelte';

  export let onDebugClick: () => void;
</script>

<section>
  <Accordion title="Options" icon="settings" readOnly stackSummary>
    <div slot="summary" class="flex flex-row items-center gap-4">
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

      <Button variant="destructive" on:click={onDebugClick}>Debug</Button>
    </div>
  </Accordion>
</section>
