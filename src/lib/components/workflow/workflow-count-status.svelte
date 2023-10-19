<script lang="ts">
  import { loading, updating } from '$lib/stores/workflows';
  import type { WorkflowStatus as Status } from '$lib/types/workflows';

  import WorkflowStatus from '../workflow-status.svelte';

  export let status: Status;
  export let count = 0;
</script>

<WorkflowStatus
  loading={$loading || $updating}
  {count}
  {status}
  test-id="workflow-status-{status}"
/>
