<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowExecutionStartedEvent;
</script>

<KeyValueTable data={event.workflowExecutionStartedEventAttributes} />
