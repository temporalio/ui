<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import {
    type WorkerInfo,
    type WorkerPollerInfo,
    type WorkerSlotsInfo,
  } from '$lib/services/worker-service';
  import { routeForTaskQueue } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import SdkLogo from '../lines-and-dots/sdk-logo.svelte';

  type Props = {
    worker: WorkerInfo;
  };

  let { worker }: Props = $props();

  const { namespace } = $derived(page.params);
  const heartbeat = $derived(worker.workerHeartbeat);
  const status = $derived(fromScreamingEnum(heartbeat.status, 'WorkerStatus'));

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

  const isRunning = $derived(status === 'Running');
</script>

<div class="flex flex-col gap-4">
  <div class="grid grid-cols-2 gap-4">
    <Card>
      <div class="text-sm uppercase tracking-wide text-secondary">
        Active Workers
      </div>
      <div class="mt-1 text-3xl font-semibold">1</div>
      <div class="mt-1 flex items-center gap-1.5">
        <span
          class="inline-block h-2 w-2 rounded-full {isRunning
            ? 'bg-green-500'
            : 'bg-gray-400'}"
        ></span>
        <span class="text-sm {isRunning ? 'text-success' : 'text-secondary'}">
          {status}
        </span>
      </div>
    </Card>

    <Card>
      <div class="text-sm uppercase tracking-wide text-secondary">
        Total Processed Tasks
      </div>
      <div class="mt-1 text-3xl font-semibold">{totalProcessedTasks}</div>
      <div class="mt-1 text-sm text-secondary">
        {workflowProcessedTasks} workflow · {activityProcessedTasks} activity
      </div>
    </Card>
  </div>

  <div class="flex flex-col gap-4 lg:flex-row">
    <div class="flex flex-1 flex-col gap-4">
      <Card class="flex flex-col gap-4">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <Badge
                type={isRunning ? 'success' : 'danger'}
                class="flex items-center gap-1"
              >
                {#if isRunning}
                  <span
                    class="inline-block h-1.5 w-1.5 rounded-full bg-green-600"
                  ></span>
                {/if}
                {status}
              </Badge>
              <h2 class="text-lg font-semibold">{heartbeat.workerIdentity}</h2>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-x-8 gap-y-4 border-t border-subtle pt-4">
          <div>
            <div class="text-base uppercase tracking-wide text-secondary">
              Task Queue
            </div>
            <Link
              href={routeForTaskQueue({
                namespace,
                queue: heartbeat.taskQueue,
              })}
              class="text-base"
            >
              {heartbeat.taskQueue}
            </Link>
          </div>
          <div>
            <div class="text-base uppercase tracking-wide text-secondary">
              SDK
            </div>
            <SdkLogo
              sdk={heartbeat.sdkName.split('-')[1]}
              version={heartbeat.sdkVersion}
            />
          </div>
        </div>
        <div>
          <h3
            class="mb-3 text-base font-medium uppercase tracking-wide text-secondary"
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

        <div>
          <h3
            class="mb-3 text-base font-medium uppercase tracking-wide text-secondary"
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
      </Card>
    </div>

    <div class="flex w-full flex-col gap-4 lg:w-1/3">
      {@render timestamps()}
      {@render hostInfo()}
      {@render deploymentInfo()}
      {@render usage()}
      {@render cache()}
    </div>
  </div>
</div>

{#snippet slotCard(title: string, slots: WorkerSlotsInfo)}
  <Card class="surface-secondary">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm font-medium">{title}</span>
      <Badge type="subtle" class="text-xs">{slots.slotSupplierKind}</Badge>
    </div>
    <div class="flex items-end gap-4">
      <div>
        <span class="text-2xl font-semibold text-blue-500">
          {slots.currentUsedSlots ?? 0}
        </span>
        <span class="text-sm text-secondary">Used</span>
      </div>
      <div>
        <span class="text-2xl font-semibold"
          >{slots.currentAvailableSlots ?? 0}</span
        >
        <span class="text-sm text-secondary">Available</span>
      </div>
      <div>
        <span class="text-2xl font-semibold text-success">
          {slots.totalProcessedTasks ?? 0}
        </span>
        <span class="text-sm text-secondary">Processed</span>
      </div>
    </div>
    {#if slots.currentAvailableSlots}
      <div class="grid grid-cols-[repeat(50,minmax(0,1fr))] gap-1">
        {#each new Array(slots.currentAvailableSlots) as _, i}
          <div
            class="h-2 w-2 {i < slots.currentUsedSlots
              ? 'bg-blue-500'
              : 'bg-subtle'}"
          ></div>
        {/each}
      </div>
    {/if}
  </Card>
{/snippet}

{#snippet pollerCard(title: string, poller: WorkerPollerInfo)}
  <Card class="surface-secondary">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">{title}</span>
      <span class="text-3xl font-semibold text-primary">
        {poller.currentPollers ?? 0}
      </span>
    </div>
    <div class="text-xs text-secondary">
      {#if poller.lastSuccessfulPollTime}
        Last poll: <Timestamp dateTime={poller.lastSuccessfulPollTime} />
      {:else}
        No activity
      {/if}
    </div>
  </Card>
{/snippet}

{#snippet timestamps()}
  <Card>
    <div class="flex flex-col gap-3">
      <div class="text-sm">
        <div class="uppercase tracking-wide text-secondary">Start Time</div>
        <Timestamp
          dateTime={heartbeat.startTime}
          as="div"
          class="font-mono text-xs"
        />
      </div>
      <div class="text-sm">
        <div class="uppercase tracking-wide text-secondary">Last Heartbeat</div>
        <Timestamp
          dateTime={heartbeat.heartbeatTime}
          as="div"
          class="font-mono text-xs"
        />
        <div class="text-xs text-orange-400">
          ~{heartbeat.elapsedSinceLastHeartbeat} ago
        </div>
      </div>
    </div>
  </Card>
{/snippet}

{#snippet hostInfo()}
  <Card>
    <div class="mb-3 flex items-center gap-2">
      <Icon name="laptop-code" class="text-secondary" />
      <h3 class="text-sm font-medium">Host Information</h3>
    </div>
    <div class="flex flex-col gap-3">
      <div class="flex flex flex-wrap items-center justify-between text-sm">
        <span class="text-secondary">Hostname</span>
        <span class="font-mono">{heartbeat.hostInfo.hostName}</span>
      </div>
      <div class="flex flex flex-wrap items-center justify-between text-sm">
        <span class="text-secondary">Process ID</span>
        <span class="font-mono">{heartbeat.hostInfo.processId}</span>
      </div>
      <div class="flex flex-wrap items-center justify-between text-sm">
        <span class="text-secondary">Instance Key</span>
        <span class="font-mono text-xs">
          {heartbeat.workerInstanceKey}
        </span>
      </div>
      <div class="flex flex-wrap items-center justify-between text-sm">
        <span class="text-secondary">Worker Grouping Key</span>
        <span class="font-mono text-xs">
          {heartbeat.hostInfo.workerGroupingKey}
        </span>
      </div>
    </div>
  </Card>
{/snippet}

{#snippet deploymentInfo()}
  {#if heartbeat.deploymentVersion?.deploymentName}
    <Card>
      <div class="mb-3 flex items-center gap-2">
        <Icon name="merge" class="text-secondary" />
        <h3 class="text-sm font-medium">Deployment Version</h3>
      </div>
      <div class="flex flex-col gap-3">
        <div class="text-sm">
          <div class="text-xs uppercase text-secondary">Deployment</div>
          <Link href="#" class="break-all text-sm">
            {heartbeat.deploymentVersion.deploymentName}
          </Link>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-secondary">Build ID</span>
          <span>{heartbeat.deploymentVersion.buildId}</span>
        </div>
      </div>
    </Card>
  {/if}
{/snippet}

{#snippet usage()}
  <Card>
    <div class="mb-3 flex items-center gap-2">
      <Icon name="usage" class="text-secondary" />
      <h3 class="text-sm font-medium">Host Usage</h3>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <Card class="surface-secondary">
        <div>
          <p class="text-2xl font-semibold text-blue-500">
            {heartbeat.hostInfo.currentHostCpuUsage.toFixed(1)}%
          </p>
          <p class="text-xs uppercase tracking-wide text-secondary">
            CPU Usage
          </p>
        </div>
      </Card>
      <Card class="surface-secondary">
        <div>
          <p class="text-2xl font-semibold">
            {heartbeat.hostInfo.currentHostMemUsage.toFixed(1)}%
          </p>
          <p class="text-xs uppercase tracking-wide text-secondary">
            Memory Usage
          </p>
        </div>
      </Card>
    </div>
  </Card>
{/snippet}

{#snippet cache()}
  <Card>
    <div class="mb-3 flex items-center gap-2">
      <Icon name="lightning-bolt" class="text-secondary" />
      <h3 class="text-sm font-medium">Sticky Cache</h3>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <Card class="surface-secondary">
        <div>
          <p class="text-2xl font-semibold text-blue-500">
            {totalStickyCacheHit}
          </p>
          <p class="text-xs uppercase tracking-wide text-secondary">
            Cache Hits
          </p>
        </div>
      </Card>
      <Card class="surface-secondary">
        <div>
          <p class="text-2xl font-semibold">{currentStickyCacheSize}</p>
          <p class="text-xs uppercase tracking-wide text-secondary">
            Cache Size
          </p>
        </div>
      </Card>
    </div>
  </Card>
{/snippet}
