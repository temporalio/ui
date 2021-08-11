<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionStartedEvent;
</script>

 <KeyValueTable data={event.childWorkflowExecutionStartedEventAttributes} />

