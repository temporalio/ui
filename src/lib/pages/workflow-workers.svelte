<script lang="ts">
  import { workflowRun } from '$lib/stores/workflow-run';

  import WorkersList from '$lib/components/workers-list.svelte';

  $: ({ workers, workflow, compatibility } = $workflowRun);
</script>

<WorkersList taskQueue={workflow?.taskQueue} {workers} {compatibility} />
