<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowExecutionCompletedEvent;
</script>

 <KeyValueTable data={event.workflowExecutionCompletedEventAttributes} />

