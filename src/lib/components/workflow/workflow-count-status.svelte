<script lang="ts">
  import type { WorkflowStatus as Status } from '$lib/types/workflows';

  import WorkflowStatus from '../workflow-status.svelte';

  export let status: Status;
  export let count = 0;
  export let newCount = 0;
</script>

<WorkflowStatus
  {count}
  {newCount}
  {status}
  test-id="workflow-status-{status}"
/>
