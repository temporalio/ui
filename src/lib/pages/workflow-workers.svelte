<script lang="ts">
  import WorkersList from '$lib/components/workers-list.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workers, workflow, compatibility, reachability } = $workflowRun);
</script>

<WorkersList
  taskQueue={workflow?.taskQueue}
  {workers}
  {compatibility}
  {reachability}
/>
