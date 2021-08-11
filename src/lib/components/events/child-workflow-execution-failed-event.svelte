<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionFailedEvent;
</script>

<KeyValueTable data={event.childWorkflowExecutionFailedEventAttributes} />
