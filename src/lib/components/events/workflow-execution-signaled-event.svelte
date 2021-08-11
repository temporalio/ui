<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowExecutionSignaledEvent;
</script>

 <KeyValueTable data={event.workflowExecutionSignaledEventAttributes} />

