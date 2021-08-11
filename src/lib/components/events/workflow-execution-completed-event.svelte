<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowExecutionCompletedEvent;
</script>

<KeyValueTable data={event.workflowExecutionCompletedEventAttributes} />
