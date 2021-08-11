<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionCompletedEvent;
</script>

<KeyValueTable data={event.childWorkflowExecutionCompletedEventAttributes} />
