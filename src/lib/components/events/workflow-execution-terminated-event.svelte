<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowExecutionTerminatedEvent;
</script>

<KeyValueTable data={event.workflowExecutionTerminatedEventAttributes} />
