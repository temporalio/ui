<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ExternalWorkflowExecutionSignaledEvent;
</script>

<KeyValueTable data={event.externalWorkflowExecutionSignaledEventAttributes} />
