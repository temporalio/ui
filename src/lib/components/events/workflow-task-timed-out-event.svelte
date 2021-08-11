<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: WorkflowTaskTimedOutEvent;
</script>

<KeyValueTable data={event.workflowTaskTimedOutEventAttributes} />
