<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowTaskStartedEvent;
</script>

<KeyValueTable data={event.workflowTaskStartedEventAttributes} />
