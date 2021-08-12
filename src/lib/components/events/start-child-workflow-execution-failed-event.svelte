<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: StartChildWorkflowExecutionFailedEvent;
</script>

<KeyValueTable data={event.startChildWorkflowExecutionFailedEventAttributes} />
