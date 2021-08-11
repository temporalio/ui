<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionCompletedEvent;
</script>

 <KeyValueTable data={event.childWorkflowExecutionCompletedEventAttributes} />

