<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowTaskFailedEvent;
</script>

 <KeyValueTable data={event.workflowTaskFailedEventAttributes} />

