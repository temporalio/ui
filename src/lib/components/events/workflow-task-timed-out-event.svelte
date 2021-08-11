<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: WorkflowTaskTimedOutEvent;
</script>

<KeyValueTable data={event.workflowTaskTimedOutEventAttributes} />
