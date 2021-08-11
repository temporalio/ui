<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowExecutionContinuedAsNewEvent;
</script>

<KeyValueTable data={event.workflowExecutionContinuedAsNewEventAttributes} />
