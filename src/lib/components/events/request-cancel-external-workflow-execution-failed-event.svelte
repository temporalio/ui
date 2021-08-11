<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: RequestCancelExternalWorkflowExecutionFailedEvent;
</script>

<KeyValueTable
  data={event.requestCancelExternalWorkflowExecutionFailedEventAttributes}
/>
