<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { type WorkerInfo } from '$lib/services/worker-service';
  import { routeForWorkerInstance } from '$lib/utilities/route-for';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  import SdkLogo from '../lines-and-dots/sdk-logo.svelte';
  import WorkerStatus from '../workers/worker-status.svelte';

  import WorkerTableCell from './worker-table-cell.svelte';

  type Props = {
    worker: WorkerInfo;
    namespace: string;
    columns: { label: string }[];
    filterable?: boolean;
  };

  let { columns, worker, namespace, filterable = false }: Props = $props();
  const status = $derived(
    toWorkerStatusReadable(worker.workerHeartbeat.status),
  );
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('workers.identity')}
      <WorkerTableCell
        attribute="WorkerIdentity"
        value={worker.workerHeartbeat.workerIdentity}
        {filterable}
      />
    {:else if label === translate('workers.task-queue')}
      <WorkerTableCell
        attribute="TaskQueue"
        value={worker.workerHeartbeat.taskQueue}
        {filterable}
      />
    {:else if label === translate('workers.host-name')}
      <WorkerTableCell
        attribute="HostName"
        value={worker.workerHeartbeat.hostInfo.hostName}
        {filterable}
      />
    {:else if label === translate('workers.instance')}
      <WorkerTableCell
        attribute="WorkerInstanceKey"
        value={worker.workerHeartbeat.workerInstanceKey}
        href={routeForWorkerInstance({
          namespace,
          workerInstanceKey: worker.workerHeartbeat.workerInstanceKey,
        })}
        {filterable}
      />
    {:else if label === translate('workers.status')}
      <td>
        <WorkerStatus {status} />
      </td>
    {:else if label === translate('workers.sdk')}
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
    {:else if label === translate('workers.workflow-task-slots')}
      <td
        >{worker.workerHeartbeat?.workflowTaskSlotsInfo?.currentUsedSlots ?? 0} /
        {worker.workerHeartbeat?.workflowTaskSlotsInfo?.currentAvailableSlots ??
          0}</td
      >
    {:else if label === translate('workers.activity-task-slots')}
      <td
        >{worker.workerHeartbeat?.activityTaskSlotsInfo?.currentUsedSlots ?? 0} /
        {worker.workerHeartbeat?.activityTaskSlotsInfo?.currentAvailableSlots ??
          0}</td
      >
    {:else if label === translate('workers.nexus-task-slots')}
      <td
        >{worker.workerHeartbeat?.nexusTaskSlotsInfo?.currentUsedSlots ?? 0} / {worker
          .workerHeartbeat?.nexusTaskSlotsInfo?.currentAvailableSlots ?? 0}</td
      >
    {/if}
  {/each}
</tr>
