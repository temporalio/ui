<script lang="ts">
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkerStatus from '$lib/components/workers/worker-status.svelte';
  import type { WorkerHeartbeat, WorkerListInfo } from '$lib/types';
  import { formatSDKName } from '$lib/utilities/get-sdk-version';
  import { createFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import {
    routeForWorkerDeployment,
    routeForWorkerInstance,
  } from '$lib/utilities/route-for';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  import WorkersTableCell from './workers-table-cell.svelte';

  interface Props {
    worker: WorkerListInfo | WorkerHeartbeat;
    namespace: string;
    filterable?: boolean;
  }

  let { worker, namespace, filterable = false }: Props = $props();
  const status = $derived(toWorkerStatusReadable(worker?.status));
</script>

<tr>
  <td>
    <WorkerStatus {status} />
  </td>
  <WorkersTableCell
    attribute="WorkerInstanceKey"
    value={worker?.workerInstanceKey}
    href={worker?.workerInstanceKey
      ? routeForWorkerInstance({
          namespace,
          workerInstanceKey: worker.workerInstanceKey,
        })
      : undefined}
    {filterable}
  />
  <WorkersTableCell
    attribute="DeploymentName"
    value={worker?.deploymentVersion?.deploymentName}
    href={worker?.deploymentVersion?.deploymentName
      ? routeForWorkerDeployment({
          namespace,
          deployment: worker.deploymentVersion.deploymentName,
        })
      : undefined}
    {filterable}
  />
  <!-- TODO: Make Build ID filterable with DT-3745 -->
  <WorkersTableCell
    attribute="BuildId"
    value={worker?.deploymentVersion?.buildId}
  />
  <WorkersTableCell
    attribute="TaskQueue"
    value={worker?.taskQueue}
    {filterable}
  />
  <WorkersTableCell
    attribute="WorkerIdentity"
    value={worker?.workerIdentity}
    {filterable}
  />
  <WorkersTableCell
    attribute="HostName"
    value={'hostName' in worker
      ? worker?.hostName
      : 'hostInfo' in worker
        ? worker?.hostInfo?.hostName
        : ''}
    {filterable}
  />
  <WorkersTableCell
    attribute="StartTime"
    value={$timestamp(worker?.startTime)}
  />
  <WorkersTableCell
    copyable={false}
    {filterable}
    filters={[
      ...(worker?.sdkName
        ? [
            createFilter({
              attribute: 'SdkName',
              value: worker.sdkName,
              conditional: '=',
            }),
          ]
        : []),
      ...(worker?.sdkVersion
        ? [
            createFilter({
              attribute: 'SdkVersion',
              value: worker.sdkVersion,
              conditional: '=',
            }),
          ]
        : []),
    ]}
  >
    <SdkLogo
      sdk={formatSDKName(worker?.sdkName)}
      version={worker?.sdkVersion ?? ''}
    />
  </WorkersTableCell>
</tr>
