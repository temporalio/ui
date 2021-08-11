<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: SignalExternalWorkflowExecutionFailedEvent;
</script>

 <KeyValueTable data={event.signalExternalWorkflowExecutionFailedEventAttributes} />

