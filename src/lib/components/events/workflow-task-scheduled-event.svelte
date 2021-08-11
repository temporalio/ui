<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowTaskScheduledEvent;
</script>

 <KeyValueTable data={event.workflowTaskScheduledEventAttributes} />

