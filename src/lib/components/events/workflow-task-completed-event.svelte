<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowTaskCompletedEvent;
</script>

 <KeyValueTable data={event.workflowTaskCompletedEventAttributes} />

