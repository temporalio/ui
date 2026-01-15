<script lang="ts">
  import WorkerTable from '$lib/components/worker-table.svelte';
  import type { TaskQueueResponse } from '$lib/types';

  interface Props {
    workers: TaskQueueResponse;
    searchAttributes: Record<string, string> | undefined;
  }

  let { workers, searchAttributes }: Props = $props();
</script>

<WorkerTable {workers} {searchAttributes} />
