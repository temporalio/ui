<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';
</script>

{#if $inProgressBatchOperation}
  <Alert
    icon="info"
    intent="info"
    title="Maximum concurrent Batch Operations met"
  >
    Only 1 in progress Batch Operation is permitted. If you are attempting to
    create a new Batch Operation while there is one currently running, it will
    fail.
  </Alert>
{/if}
