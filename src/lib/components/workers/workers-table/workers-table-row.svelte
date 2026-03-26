<script lang="ts">
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkerStatus from '$lib/components/workers/worker-status.svelte';
  import type { WorkerInfo } from '$lib/types';
  import { formatSDKName } from '$lib/utilities/get-sdk-version';
  import { createFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import {
    routeForWorkerDeployment,
    routeForWorkerInstance,
  } from '$lib/utilities/route-for';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  import WorkersTableCell from './workers-table-cell.svelte';

  interface Props {
    worker: WorkerInfo;
    namespace: string;
    filterable?: boolean;
  }

  let { worker, namespace, filterable = false }: Props = $props();
  const status = $derived(
    toWorkerStatusReadable(worker.workerHeartbeat?.status),
  );
</script>

<tr>
  <td>
    <WorkerStatus {status} />
  </td>
  <WorkersTableCell
    attribute="WorkerInstanceKey"
    value={worker.workerHeartbeat?.workerInstanceKey}
    href={worker.workerHeartbeat?.workerInstanceKey
      ? routeForWorkerInstance({
          namespace,
          workerInstanceKey: worker.workerHeartbeat.workerInstanceKey,
        })
      : undefined}
    {filterable}
  />
  <WorkersTableCell
    attribute="DeploymentName"
    value={worker.workerHeartbeat?.deploymentVersion?.deploymentName}
    href={worker.workerHeartbeat?.deploymentVersion?.deploymentName
      ? routeForWorkerDeployment({
          namespace,
          deployment: worker.workerHeartbeat.deploymentVersion.deploymentName,
        })
      : undefined}
    {filterable}
  />
  <!-- TODO: Make Build ID filterable when API supports it -->
  <WorkersTableCell
    attribute="BuildId"
    value={worker.workerHeartbeat?.deploymentVersion?.buildId}
  />
  <WorkersTableCell
    attribute="TaskQueue"
    value={worker.workerHeartbeat?.taskQueue}
    {filterable}
  />
  <WorkersTableCell
    attribute="WorkerIdentity"
    value={worker.workerHeartbeat?.workerIdentity}
    {filterable}
  />
  <WorkersTableCell
    attribute="HostName"
    value={worker.workerHeartbeat?.hostInfo?.hostName}
    {filterable}
  />
  <WorkersTableCell
    attribute="StartTime"
    value={$timestamp(worker.workerHeartbeat?.startTime)}
  />
  <WorkersTableCell
    copyable={false}
    {filterable}
    filters={[
      createFilter({
        attribute: 'SdkName',
        value: worker.workerHeartbeat?.sdkName,
        conditional: '=',
      }),
      createFilter({
        attribute: 'SdkVersion',
        value: worker.workerHeartbeat?.sdkVersion,
        conditional: '=',
      }),
    ]}
  >
    <SdkLogo
      sdk={formatSDKName(worker.workerHeartbeat?.sdkName)}
      version={worker.workerHeartbeat?.sdkVersion ?? ''}
    />
  </WorkersTableCell>
</tr>
