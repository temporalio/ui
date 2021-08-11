<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowExecutionCanceledEvent;
</script>

<KeyValueTable data={event.workflowExecutionCanceledEventAttributes} />
