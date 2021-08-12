<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowExecutionCancelRequestedEvent;
</script>

<KeyValueTable data={event.workflowExecutionCancelRequestedEventAttributes} />
