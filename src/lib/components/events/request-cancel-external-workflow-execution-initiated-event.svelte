<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: RequestCancelExternalWorkflowExecutionInitiatedEvent;
</script>

<KeyValueTable
  data={event.requestCancelExternalWorkflowExecutionInitiatedEventAttributes}
/>
