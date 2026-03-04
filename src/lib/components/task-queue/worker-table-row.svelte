<script lang="ts">
  import type { WorkerInfo } from '$lib/types';
  import { routeForWorkerInstance } from '$lib/utilities/route-for';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  import SdkLogo from '../lines-and-dots/sdk-logo.svelte';
  import WorkerStatus from '../workers/worker-status.svelte';

  import WorkerTableCell from './worker-table-cell.svelte';

  interface Props {
    worker: WorkerInfo;
    namespace: string;
    filterable?: boolean;
  }

  let { worker, namespace, filterable = false }: Props = $props();
  const status = $derived(
    toWorkerStatusReadable(worker.workerHeartbeat.status),
  );
</script>

<tr>
  <td>
    <WorkerStatus {status} />
  </td>
  <WorkerTableCell
    attribute="WorkerInstanceKey"
    value={worker.workerHeartbeat.workerInstanceKey}
    href={routeForWorkerInstance({
      namespace,
      workerInstanceKey: worker.workerHeartbeat.workerInstanceKey,
    })}
    {filterable}
  />
  <WorkerTableCell
    attribute="TaskQueue"
    value={worker.workerHeartbeat.taskQueue}
    {filterable}
  />
  <WorkerTableCell
    attribute="WorkerIdentity"
    value={worker.workerHeartbeat.workerIdentity}
    {filterable}
  />
  <WorkerTableCell
    attribute="HostName"
    value={worker.workerHeartbeat.hostInfo.hostName}
    {filterable}
  />
  <WorkerTableCell
    attribute="SdkName"
    value={worker.workerHeartbeat.sdkName}
    {filterable}
  >
    <SdkLogo
      sdk={worker.workerHeartbeat.sdkName.split('-')[1]}
      version={worker.workerHeartbeat.sdkVersion}
    />
  </WorkerTableCell>
</tr>
