<script lang="ts">
  import WorkersList from '$lib/components/workers-list.svelte';
  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;
</script>

<WorkersList taskQueue={workflow.taskQueue} {workers} />
