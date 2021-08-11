<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ExternalWorkflowExecutionSignaledEvent;
</script>

 <KeyValueTable data={event.externalWorkflowExecutionSignaledEventAttributes} />

