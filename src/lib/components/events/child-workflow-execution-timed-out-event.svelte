<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionTimedOutEvent;
</script>

<KeyValueTable data={event.childWorkflowExecutionTimedOutEventAttributes} />
