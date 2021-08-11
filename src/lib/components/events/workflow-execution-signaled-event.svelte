<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowExecutionSignaledEvent;
</script>

<KeyValueTable data={event.workflowExecutionSignaledEventAttributes} />
