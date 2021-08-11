<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowExecutionTerminatedEvent;
</script>

<KeyValueTable data={event.workflowExecutionTerminatedEventAttributes} />
