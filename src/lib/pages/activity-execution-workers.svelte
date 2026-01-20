<script lang="ts">
  import WorkerTable from '$lib/components/worker-table.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import { activityExecution } from '$lib/utilities/activity-execution-poller.svelte';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import { isEmptyObject } from '$lib/utilities/is';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();

  const searchAttributes = $derived($activityExecution.info.searchAttributes);

  const getPollersRequest = $derived(
    getPollers({ queue: $activityExecution.info.taskQueue, namespace }),
  );

  const decodedSearchAttributes = $derived.by(() => {
    if (isEmptyObject(searchAttributes)) return {};

    const decoded = Object.entries(searchAttributes.indexedFields).reduce(
      (searchAttributes, [searchAttributeName, payload]) => {
        return {
          ...searchAttributes,
          [searchAttributeName]: decodePayload(payload),
        };
      },
      {},
    );
    return decoded;
  });
</script>

{#await getPollersRequest then workers}
  <WorkerTable {workers} searchAttributes={decodedSearchAttributes} />
{/await}
