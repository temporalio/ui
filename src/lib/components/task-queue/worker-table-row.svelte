<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type WorkerInfo } from '$lib/services/worker-service';
  import { routeForWorkerInstance } from '$lib/utilities/route-for';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  import SdkLogo from '../lines-and-dots/sdk-logo.svelte';

  import WorkerTableCell from './worker-table-cell.svelte';

  type Props = {
    worker: WorkerInfo;
    namespace: string;
    columns: { label: string }[];
  };

  let { columns, worker, namespace }: Props = $props();
  const status = $derived(
    toWorkerStatusReadable(worker.workerHeartbeat.status),
  );
  const isRunning = $derived(status === 'Running');
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('workers.identity')}
      <td>{worker.workerHeartbeat.workerIdentity}</td>
    {:else if label === translate('workers.task-queue')}
      <WorkerTableCell
        attribute="TaskQueue"
        value={worker.workerHeartbeat.taskQueue}
      />
    {:else if label === translate('workers.instance')}
      <WorkerTableCell
        attribute="WorkerInstanceKey"
        value={worker.workerHeartbeat.workerInstanceKey}
        href={routeForWorkerInstance({
          namespace,
          workerInstanceKey: worker.workerHeartbeat.workerInstanceKey,
        })}
      />
    {:else if label === translate('workers.status')}
      <WorkerTableCell attribute="Status" value={status}>
        <Badge
          type={isRunning ? 'success' : 'danger'}
          class="flex items-center gap-1"
        >
          {#if isRunning}
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-green-600"
            ></span>
          {/if}
          {status}
        </Badge>
      </WorkerTableCell>
    {:else if label === translate('workers.sdk')}
      <WorkerTableCell
        attribute="SdkName"
        value={worker.workerHeartbeat.sdkName}
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
