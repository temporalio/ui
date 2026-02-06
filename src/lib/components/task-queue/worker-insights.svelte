<script lang="ts">
  import { page } from '$app/state';

  import WorkerTable from '$lib/components/task-queue/worker-table.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { namespace, queue } = $derived(page.params);
  const taskQueue = $derived($workflowRun?.workflow?.taskQueue || queue);
</script>

<WorkerTable {namespace} {taskQueue} />
