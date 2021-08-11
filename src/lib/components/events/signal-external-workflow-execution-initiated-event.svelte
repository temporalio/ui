<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: SignalExternalWorkflowExecutionInitiatedEvent;
</script>

<KeyValueTable
  data={event.signalExternalWorkflowExecutionInitiatedEventAttributes}
/>
