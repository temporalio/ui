<script lang="ts">
  import type { WorkflowRunWithWorkers } from '$lib/stores/workflow-run';

  import WorkersList from '$lib/components/workers-list.svelte';

  export let workflowRun: WorkflowRunWithWorkers;

  $: ({ workers, workflow } = workflowRun);
</script>

<WorkersList taskQueue={workflow.taskQueue} {workers} />
