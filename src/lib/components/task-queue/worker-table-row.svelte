<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { WorkerInfo } from '$lib/types';
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
    {#if label === translate('workers.status')}
      <td>
        <WorkerStatus {status} />
      </td>
    {:else if label === translate('workers.name')}
      <WorkerTableCell
        attribute="WorkerInstanceKey"
        value={worker.workerHeartbeat.workerInstanceKey}
        href={routeForWorkerInstance({
          namespace,
          workerInstanceKey: worker.workerHeartbeat.workerInstanceKey,
        })}
        {filterable}
      />
    {:else if label === translate('workers.task-queue')}
      <WorkerTableCell
        attribute="TaskQueue"
        value={worker.workerHeartbeat.taskQueue}
        {filterable}
      />
    {:else if label === translate('workers.compute')}
      <td>{translate('workers.self-managed')}</td>
    {:else if label === translate('workers.last-heartbeat')}
      <td>{worker.workerHeartbeat.heartbeatTime}</td>
    {:else if label === translate('workers.sdk-version')}
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
    {:else if label === ''}
      <td></td>
    {:else}
      <td></td>
    {/if}
  {/each}
</tr>
