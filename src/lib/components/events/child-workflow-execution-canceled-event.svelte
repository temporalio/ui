<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ChildWorkflowExecutionCanceledEvent;
</script>

<KeyValueTable data={event.childWorkflowExecutionCanceledEventAttributes} />
