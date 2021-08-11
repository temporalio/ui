<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionTerminatedEvent;
</script>

 <KeyValueTable data={event.childWorkflowExecutionTerminatedEventAttributes} />

