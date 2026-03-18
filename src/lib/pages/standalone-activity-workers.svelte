<script lang="ts">
  import { page } from '$app/state';

  import WorkersTable from '$lib/components/workers/workers-table/task-queue-workers-table.svelte';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import { isEmptyObject } from '$lib/utilities/is';
  import { activityExecution } from '$lib/utilities/standalone-activity-poller.svelte';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();

  const searchAttributes = $derived($activityExecution?.info?.searchAttributes);
  const taskQueue = $derived($activityExecution?.info?.taskQueue ?? '');
  const workerHeartbeatsEnabled = $derived(
    !!page.data.namespace.namespaceInfo?.capabilities?.workerHeartbeats,
  );

  const decodedSearchAttributes = $derived.by(() => {
    if (isEmptyObject(searchAttributes)) return {};

    const decoded = Object.entries(
      searchAttributes?.indexedFields ?? {},
    ).reduce((searchAttributes, [searchAttributeName, payload]) => {
      return {
        ...searchAttributes,
        [searchAttributeName]: decodePayload(payload),
      };
    }, {});
    return decoded;
  });
</script>

<WorkersTable
  {namespace}
  {taskQueue}
  searchAttributes={decodedSearchAttributes}
  useFallback={!workerHeartbeatsEnabled}
/>
