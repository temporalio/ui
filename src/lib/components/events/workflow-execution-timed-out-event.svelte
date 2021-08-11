<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowExecutionTimedOutEvent;
</script>

 <KeyValueTable data={event.workflowExecutionTimedOutEventAttributes} />

