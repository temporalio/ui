<script lang="ts">
  import WorkersList from '$lib/components/workers-list.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workers, workflow, rules, compatibility, reachability } = $workflowRun);
</script>

<WorkersList
  taskQueue={workflow?.taskQueue}
  {workers}
  {rules}
  {compatibility}
  {reachability}
/>
