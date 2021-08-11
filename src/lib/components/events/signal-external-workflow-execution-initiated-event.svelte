<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: SignalExternalWorkflowExecutionInitiatedEvent;
</script>

 <KeyValueTable data={event.signalExternalWorkflowExecutionInitiatedEventAttributes} />

