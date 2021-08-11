<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionCanceledEvent;
</script>

<KeyValueTable data={event.childWorkflowExecutionCanceledEventAttributes} />
