<script lang="ts">
  import { page } from '$app/state';

  import WorkersTable from '$lib/components/workers/workers-table/task-queue-workers-table.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    namespace: string;
    queue: string;
    useFallback?: boolean;
  }

  let { namespace, queue: taskQueue, useFallback = false }: Props = $props();
  const workerHeartbeatsEnabled = $derived(
    !!page.data.namespace.namespaceInfo?.capabilities?.workerHeartbeats,
  );
</script>

<section class="flex flex-col gap-4">
  <h1 data-testid="task-queue-title">{translate('workers.task-queue')}</h1>
  <h2 data-testid="task-queue-name">
    {taskQueue}
  </h2>
  <WorkersTable
    {namespace}
    {taskQueue}
    useFallback={!workerHeartbeatsEnabled || useFallback}
  />
</section>
