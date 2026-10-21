<script lang="ts">
  import { page } from '$app/state';

  import WorkersTable from '$lib/components/workers/workers-table/task-queue-workers-table.svelte';
  import { activityWorkerCount } from '$lib/stores/activities';
  import { parseSearchAttributes } from '$lib/utilities/decode-payload';
  import { activityExecution } from '$lib/utilities/standalone-activity-poller.svelte';

  interface Props {
    namespace: string;
    useFallback?: boolean;
  }

  let { namespace, useFallback = false }: Props = $props();

  const searchAttributes = $derived($activityExecution?.info?.searchAttributes);
  const taskQueue = $derived($activityExecution?.info?.taskQueue ?? '');
  const workerHeartbeatsEnabled = $derived(
    !!page.data.namespace.namespaceInfo?.capabilities?.workerHeartbeats,
  );

  const decodedSearchAttributes = $derived(
    parseSearchAttributes(searchAttributes ?? {}).indexedFields ?? {},
  );
</script>

<WorkersTable
  {namespace}
  {taskQueue}
  searchAttributes={decodedSearchAttributes}
  useFallback={!workerHeartbeatsEnabled || useFallback}
  onCount={(count) => ($activityWorkerCount = count)}
/>
