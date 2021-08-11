<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: RequestCancelExternalWorkflowExecutionInitiatedEvent;
</script>

<KeyValueTable
  data={event.requestCancelExternalWorkflowExecutionInitiatedEventAttributes}
/>
