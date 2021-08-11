<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionStartedEvent;
</script>

<KeyValueTable data={event.childWorkflowExecutionStartedEventAttributes} />
