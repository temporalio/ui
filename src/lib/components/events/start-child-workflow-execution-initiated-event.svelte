<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: StartChildWorkflowExecutionInitiatedEvent;
</script>

<KeyValueTable
  data={event.startChildWorkflowExecutionInitiatedEventAttributes}
/>
