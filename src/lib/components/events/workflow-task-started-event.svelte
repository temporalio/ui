<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowTaskStartedEvent;
</script>

<KeyValueTable data={event.workflowTaskStartedEventAttributes} />
