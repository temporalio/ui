<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { type WorkerInfo } from '$lib/services/worker-service';
  import { routeForTaskQueue } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  type Props = {
    worker: WorkerInfo;
  };

  let { worker }: Props = $props();

  const { namespace } = $derived(page.params);
  const heartbeat = $derived(worker.workerHeartbeat);
  const status = $derived(fromScreamingEnum(heartbeat.status, 'WorkerStatus'));
  const totalAvailableSlots = $derived(
    (heartbeat.workflowTaskSlotsInfo?.currentAvailableSlots ?? 0) +
      (heartbeat.activityTaskSlotsInfo?.currentAvailableSlots ?? 0) +
      (heartbeat.nexusTaskSlotsInfo?.currentAvailableSlots ?? 0) +
      (heartbeat.localActivitySlotsInfo?.currentAvailableSlots ?? 0),
  );

  const totalProcessedTasks = $derived(
    (heartbeat.workflowTaskSlotsInfo?.totalProcessedTasks ?? 0) +
      (heartbeat.activityTaskSlotsInfo?.totalProcessedTasks ?? 0) +
      (heartbeat.nexusTaskSlotsInfo?.totalProcessedTasks ?? 0) +
      (heartbeat.localActivitySlotsInfo?.totalProcessedTasks ?? 0),
  );

  const workflowProcessedTasks = $derived(
    heartbeat.workflowTaskSlotsInfo?.totalProcessedTasks ?? 0,
  );
  const activityProcessedTasks = $derived(
    heartbeat.activityTaskSlotsInfo?.totalProcessedTasks ?? 0,
  );

  const totalStickyCacheHit = $derived(heartbeat?.totalStickyCacheHit ?? 0);
  const currentStickyCacheSize = $derived(
    heartbeat?.currentStickyCacheSize ?? 0,
  );

  const capacityPercent = $derived(
    totalAvailableSlots > 0
      ? Math.round(
          (totalAvailableSlots /
            (totalAvailableSlots +
              (heartbeat.workflowTaskSlotsInfo?.currentUsedSlots ?? 0) +
              (heartbeat.activityTaskSlotsInfo?.currentUsedSlots ?? 0) +
              (heartbeat.nexusTaskSlotsInfo?.currentUsedSlots ?? 0) +
              (heartbeat.localActivitySlotsInfo?.currentUsedSlots ?? 0))) *
            100,
        )
      : 0,
  );

  const isRunning = $derived(status === 'Running');
</script>

<div class="flex flex-col gap-4">
  <div class="grid grid-cols-4 gap-4">
    <div class="surface-primary rounded-lg border border-subtle p-4">
      <div class="text-xs uppercase tracking-wide text-secondary">
        Active Workers
      </div>
      <div class="mt-1 text-3xl font-semibold">1</div>
      <div class="mt-1 flex items-center gap-1.5">
        <span
          class="inline-block h-2 w-2 rounded-full {isRunning
            ? 'bg-green-500'
            : 'bg-gray-400'}"
        ></span>
        <span class="text-sm {isRunning ? 'text-green-500' : 'text-secondary'}">
          {status}
        </span>
      </div>
    </div>

    <div class="surface-primary rounded-lg border border-subtle p-4">
      <div class="text-xs uppercase tracking-wide text-secondary">
        Total Processed Tasks
      </div>
      <div class="mt-1 text-3xl font-semibold">{totalProcessedTasks}</div>
      <div class="mt-1 text-sm text-secondary">
        {workflowProcessedTasks} workflow · {activityProcessedTasks} activity
      </div>
    </div>

    <div class="surface-primary rounded-lg border border-subtle p-4">
      <div class="text-xs uppercase tracking-wide text-secondary">
        Available Slots
      </div>
      <div class="mt-1 text-3xl font-semibold">{totalAvailableSlots}</div>
      <div class="mt-1 text-sm text-green-500">
        {capacityPercent}% capacity free
      </div>
    </div>

    <div class="surface-primary rounded-lg border border-subtle p-4">
      <div class="text-xs uppercase tracking-wide text-secondary">
        Sticky Cache Hit
      </div>
      <div class="mt-1 text-3xl font-semibold">{totalStickyCacheHit}</div>
      <div class="mt-1 text-sm text-secondary">
        {currentStickyCacheSize} cached workflows
      </div>
    </div>
  </div>

  <div class="flex gap-4">
    <div class="flex flex-1 flex-col gap-4">
      <div class="surface-primary rounded-lg border border-subtle p-6">
        <div class="mb-4 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-semibold">{heartbeat.workerIdentity}</h2>
              <Badge
                type={isRunning ? 'success' : 'default'}
                class="flex items-center gap-1"
              >
                {#if isRunning}
                  <span
                    class="inline-block h-1.5 w-1.5 rounded-full bg-green-600"
                  ></span>
                {/if}
                {status}
              </Badge>
            </div>
            <div class="mt-2 flex gap-6 text-sm text-secondary">
              <div>
                <span class="text-xs uppercase">Instance:</span>
                <span class="ml-1 font-mono text-xs"
                  >{heartbeat.workerInstanceKey}</span
                >
              </div>
              <div>
                <span class="text-xs uppercase">Group:</span>
                <span class="ml-1 font-mono text-xs"
                  >{heartbeat.hostInfo.workerGroupingKey}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-3 gap-x-8 gap-y-4 border-t border-subtle pt-4"
        >
          <div>
            <div class="text-xs uppercase tracking-wide text-secondary">
              Task Queue
            </div>
            <Link
              href={routeForTaskQueue({
                namespace,
                queue: heartbeat.taskQueue,
              })}
              class="text-sm"
            >
              {heartbeat.taskQueue}
            </Link>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wide text-secondary">
              SDK
            </div>
            <div class="text-sm">{heartbeat.sdkName}</div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wide text-secondary">
              SDK Version
            </div>
            <div class="text-sm">{heartbeat.sdkVersion}</div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wide text-secondary">
              Host Name
            </div>
            <div class="font-mono text-sm">{heartbeat.hostInfo.hostName}</div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wide text-secondary">
              Process ID
            </div>
            <div class="font-mono text-sm">{heartbeat.hostInfo.processId}</div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wide text-secondary">
              Last Heartbeat
            </div>
            <div class="text-sm text-orange-400">
              ~<Timestamp dateTime={heartbeat.elapsedSinceLastHeartbeat} /> ago
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h3
            class="mb-3 text-sm font-medium uppercase tracking-wide text-secondary"
          >
            Task Slots
          </h3>
          <div class="grid grid-cols-2 gap-4">
            {@render slotCard(
              'Workflow Tasks',
              heartbeat.workflowTaskSlotsInfo,
            )}
            {@render slotCard(
              'Activity Tasks',
              heartbeat.activityTaskSlotsInfo,
            )}
            {@render slotCard('Nexus Tasks', heartbeat.nexusTaskSlotsInfo)}
            {@render slotCard(
              'Local Activities',
              heartbeat.localActivitySlotsInfo,
            )}
          </div>
        </div>

        <div class="mt-6">
          <h3
            class="mb-3 text-sm font-medium uppercase tracking-wide text-secondary"
          >
            Pollers
          </h3>
          <div class="grid grid-cols-2 gap-4">
            {@render pollerCard(
              'Workflow Poller',
              heartbeat.workflowPollerInfo,
            )}
            {@render pollerCard(
              'Workflow Sticky Poller',
              heartbeat.workflowStickyPollerInfo,
            )}
            {@render pollerCard(
              'Activity Poller',
              heartbeat.activityPollerInfo,
            )}
            {@render pollerCard('Nexus Poller', heartbeat.nexusPollerInfo)}
          </div>
        </div>
      </div>
    </div>

    <div class="flex w-80 flex-col gap-4">
      <div class="surface-secondary rounded-lg border border-subtle p-4">
        <div class="mb-3 flex items-center gap-2">
          <Icon name="laptop-code" class="text-secondary" />
          <h3 class="text-sm font-medium">Host Information</h3>
        </div>
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary">Hostname</span>
            <span class="font-mono">{heartbeat.hostInfo.hostName}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary">Process ID</span>
            <span class="font-mono">{heartbeat.hostInfo.processId}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary">Worker Grouping Key</span>
            <span class="max-w-32 truncate font-mono text-xs">
              {heartbeat.hostInfo.workerGroupingKey}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary">CPU Usage</span>
            <div class="flex items-center gap-2">
              <div class="bg-gray-700 h-2 w-16 overflow-hidden rounded-full">
                <div
                  class="h-full bg-green-500"
                  style="width: {heartbeat.hostInfo.currentHostCpuUsage}%"
                ></div>
              </div>
              <span>{heartbeat.hostInfo.currentHostCpuUsage.toFixed(1)}%</span>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary">Memory Usage</span>
            <div class="flex items-center gap-2">
              <div class="bg-gray-700 h-2 w-16 overflow-hidden rounded-full">
                <div
                  class="h-full bg-blue-500"
                  style="width: {heartbeat.hostInfo.currentHostMemUsage}%"
                ></div>
              </div>
              <span>{heartbeat.hostInfo.currentHostMemUsage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {#if heartbeat.deploymentVersion?.deploymentName}
        <div class="surface-secondary rounded-lg border border-subtle p-4">
          <div class="mb-3 flex items-center gap-2">
            <Icon name="rocket-ship" class="text-yellow-500" />
            <h3 class="text-sm font-medium">Deployment Version</h3>
          </div>
          <div class="flex flex-col gap-3">
            <div class="text-sm">
              <div class="text-xs uppercase text-secondary">Build ID</div>
              <Link href="#" class="break-all text-sm">
                {heartbeat.deploymentVersion.buildId}
              </Link>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary">SDK</span>
              <span>{heartbeat.sdkName}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary">Version</span>
              <span>{heartbeat.sdkVersion}</span>
            </div>
          </div>
        </div>
      {/if}

      <div class="surface-secondary rounded-lg border border-subtle p-4">
        <div class="mb-3 flex items-center gap-2">
          <Icon name="lightning-bolt" class="text-yellow-400" />
          <h3 class="text-sm font-medium">Sticky Cache</h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            class="bg-gray-800/50 flex flex-col items-center justify-center rounded-lg border border-subtle p-4"
          >
            <span class="text-2xl font-semibold text-blue-400"
              >{totalStickyCacheHit}</span
            >
            <span class="text-xs uppercase tracking-wide text-secondary"
              >Cache Hits</span
            >
          </div>
          <div
            class="bg-gray-800/50 flex flex-col items-center justify-center rounded-lg border border-subtle p-4"
          >
            <span class="text-2xl font-semibold">{currentStickyCacheSize}</span>
            <span class="text-xs uppercase tracking-wide text-secondary"
              >Cache Size</span
            >
          </div>
        </div>
      </div>

      <div class="surface-secondary rounded-lg border border-subtle p-4">
        <div class="mb-3 flex items-center gap-2">
          <Icon name="clock" class="text-secondary" />
          <h3 class="text-sm font-medium">Timestamps</h3>
        </div>
        <div class="flex flex-col gap-3">
          <div class="text-sm">
            <div class="text-xs uppercase text-secondary">Start Time</div>
            <Timestamp
              dateTime={heartbeat.startTime}
              as="div"
              class="font-mono text-xs"
            />
          </div>
          <div class="text-sm">
            <div class="text-xs uppercase text-secondary">Last Heartbeat</div>
            <Timestamp
              dateTime={heartbeat.heartbeatTime}
              as="div"
              class="font-mono text-xs"
            />
            <div class="text-xs text-orange-400">
              ~<Timestamp dateTime={heartbeat.elapsedSinceLastHeartbeat} /> ago
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{#snippet slotCard(
  title: string,
  slots: import('$lib/services/worker-service').WorkerSlotsInfo,
)}
  <div class="bg-gray-800/30 rounded-lg border border-subtle p-4">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm font-medium">{title}</span>
      <Badge type="subtle" class="text-xs">{slots.slotSupplierKind}</Badge>
    </div>
    <div class="flex items-end gap-4">
      <div>
        <span class="text-2xl font-semibold text-blue-400">
          {slots.currentUsedSlots}
        </span>
        <span class="text-sm text-secondary">Used</span>
      </div>
      <div>
        <span class="text-2xl font-semibold">{slots.currentAvailableSlots}</span
        >
        <span class="text-sm text-secondary">Available</span>
      </div>
      <div>
        <span class="text-2xl font-semibold text-green-400">
          {slots.totalProcessedTasks}
        </span>
        <span class="text-sm text-secondary">Processed</span>
      </div>
    </div>
    <div class="mt-2 flex items-center gap-1">
      <span
        class="inline-block h-1.5 w-1.5 rounded-full {slots.currentUsedSlots > 0
          ? 'bg-blue-400'
          : 'bg-gray-500'}"
      ></span>
    </div>
  </div>
{/snippet}

{#snippet pollerCard(
  title: string,
  poller: import('$lib/services/worker-service').WorkerPollerInfo,
)}
  <div class="bg-gray-800/30 rounded-lg border border-subtle p-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">{title}</span>
      <span class="text-2xl font-semibold text-blue-400">
        {poller.currentPollers}
      </span>
    </div>
    <div class="mt-2 text-xs text-secondary">
      {#if poller.lastSuccessfulPollTime}
        Last poll: <Timestamp dateTime={poller.lastSuccessfulPollTime} />
      {:else}
        No activity
      {/if}
    </div>
  </div>
{/snippet}
