<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ExternalWorkflowExecutionCancelRequestedEvent;
</script>

 <KeyValueTable data={event.externalWorkflowExecutionCancelRequestedEventAttributes} />

