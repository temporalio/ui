<script lang="ts">
  import type { WorkflowExecutionStatus } from '$types/temporal/api/enums/v1/workflow';
  export let status: WorkflowExecutionStatus;
</script>

<div class="bg-green-200 px-2 rounded-xl text-center text-green-600 text-sm">
  {status}
</div>
