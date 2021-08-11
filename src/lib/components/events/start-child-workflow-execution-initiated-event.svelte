<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: StartChildWorkflowExecutionInitiatedEvent;
</script>

 <KeyValueTable data={event.startChildWorkflowExecutionInitiatedEventAttributes} />

