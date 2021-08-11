<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowExecutionCancelRequestedEvent;
</script>

 <KeyValueTable data={event.workflowExecutionCancelRequestedEventAttributes} />

