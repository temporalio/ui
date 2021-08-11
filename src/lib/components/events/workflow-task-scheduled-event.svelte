<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowTaskScheduledEvent;
</script>

 <KeyValueTable data={event.workflowTaskScheduledEventAttributes} />

