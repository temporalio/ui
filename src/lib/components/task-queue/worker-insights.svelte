<script lang="ts">
  import { page } from '$app/state';

  import WorkersTable from '$lib/components/workers/workers-table/task-queue-workers-table.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { namespace, queue } = $derived(page.params);
  const taskQueue = $derived($workflowRun?.workflow?.taskQueue || queue);
</script>

<WorkersTable {namespace} {taskQueue} />
