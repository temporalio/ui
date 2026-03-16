<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { ServerlessWorker } from '$lib/types/serverless-workers';
  import { routeForServerlessWorker } from '$lib/utilities/route-for';

  import ServerlessWorkerStatus from './serverless-worker-status.svelte';

  interface Props {
    worker: ServerlessWorker;
    namespace: string;
    columns: { label: string }[];
  }

  let { worker, namespace, columns }: Props = $props();

  const detailHref = $derived(
    routeForServerlessWorker({ namespace, id: worker.id }),
  );
</script>

<tr>
  <td><ServerlessWorkerStatus status={worker.status} /></td>
  <td>
    <a href={detailHref} class="text-blue-700 hover:underline">{worker.name}</a>
  </td>
  <td>{worker.taskQueue}</td>
  <td>
    <div class="flex items-center gap-1.5">
      <Icon name="robot" />
      <span>{worker.compute}</span>
    </div>
  </td>
  <td><Timestamp dateTime={worker.lastHeartbeat} /></td>
  <td>{worker.sdkVersion}</td>
</tr>
