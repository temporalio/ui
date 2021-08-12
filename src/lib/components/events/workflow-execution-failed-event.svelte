<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowExecutionFailedEvent;
</script>

<KeyValueTable data={event.workflowExecutionFailedEventAttributes} />
