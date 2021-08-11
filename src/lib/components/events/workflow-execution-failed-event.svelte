<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowExecutionFailedEvent;
</script>

<KeyValueTable data={event.workflowExecutionFailedEventAttributes} />
