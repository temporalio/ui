<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    WorkerInfo,
    WorkerPollerInfo,
    WorkerSlotsInfo,
  } from '$lib/types';
  import { formatDurationAbbreviated } from '$lib/utilities/format-time';
  import { routeForTaskQueue } from '$lib/utilities/route-for';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  import SdkLogo from '../lines-and-dots/sdk-logo.svelte';
  import WorkerStatus from '../workers/worker-status.svelte';

  type Props = {
    worker: WorkerInfo;
  };

  let { worker }: Props = $props();

  const { namespace } = $derived(page.params);
  const heartbeat = $derived(worker.workerHeartbeat);
  const status = $derived(toWorkerStatusReadable(heartbeat?.status));

  const totalStickyCacheHit = $derived(heartbeat?.totalStickyCacheHit ?? 0);
  const totalStickyCacheMiss = $derived(heartbeat?.totalStickyCacheMiss ?? 0);
  const currentStickyCacheSize = $derived(
    heartbeat?.currentStickyCacheSize ?? 0,
  );

  const cacheHitRate = $derived.by(() => {
    const total = totalStickyCacheHit + totalStickyCacheMiss;
    if (total === 0) return 0;
    return ((totalStickyCacheHit / total) * 100).toFixed(1);
  });
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-3">
      <WorkerStatus {status} />
      <h2 class="text-lg font-semibold">{heartbeat?.workerIdentity}</h2>
    </div>

    <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
      <div class="flex flex-col">
        <span class="text-secondary">{translate('common.task-queue')}</span>
        <Link
          href={routeForTaskQueue({
            namespace,
            queue: heartbeat?.taskQueue,
          })}
        >
          {heartbeat?.taskQueue}
        </Link>
      </div>
      <div class="flex flex-col">
        <span class="text-secondary">{translate('common.start')}</span>
        <Timestamp
          dateTime={heartbeat?.startTime}
          as="span"
          class="font-mono text-xs"
        />
      </div>
      <div class="flex flex-col">
        <span class="text-secondary"
          >{translate('workflows.last-heartbeat')}</span
        >
        <div>
          <Timestamp
            dateTime={heartbeat?.heartbeatTime}
            as="span"
            class="font-mono text-xs"
          />
          <span class="ml-1 text-information">
            {formatDurationAbbreviated(
              String(heartbeat?.elapsedSinceLastHeartbeat),
            )} ago
          </span>
        </div>
      </div>
      <div class="flex flex-col">
        <span class="text-secondary">{translate('workers.sdk')}</span>
        <SdkLogo
          sdk={heartbeat?.sdkName.split('-')[1]}
          version={heartbeat?.sdkVersion}
        />
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-4 lg:flex-row">
    <div class="flex flex-1 flex-col gap-4">
      {@render taskSlotCard(
        translate('common.workflows-plural', { count: 1 }),
        heartbeat?.workflowTaskSlotsInfo,
        heartbeat?.workflowPollerInfo,
      )}
      {@render taskSlotCard(
        translate('common.activities-plural', { count: 1 }),
        heartbeat?.activityTaskSlotsInfo,
        heartbeat?.activityPollerInfo,
      )}
      {@render taskSlotCard(
        translate('workers.nexus-tasks'),
        heartbeat?.nexusTaskSlotsInfo,
        heartbeat?.nexusPollerInfo,
      )}
      {@render taskSlotCard(
        translate('workers.local-activities'),
        heartbeat?.localActivitySlotsInfo,
        null,
      )}
    </div>

    <div class="flex w-full flex-col gap-4 lg:w-fit">
      {@render hostInfo()}
      {@render hostUsage()}
      {@render workflowCache()}
      {@render diagnostics()}
    </div>
  </div>
</div>

{#snippet taskSlotCard(
  title: string,
  slots: WorkerSlotsInfo,
  poller: WorkerPollerInfo,
)}
  <Card>
    <div class="mb-4 flex items-center gap-2">
      <h3 class="text-base font-medium">{title}</h3>
      <Badge type="ghost" class="text-xs">{slots.slotSupplierKind}</Badge>
    </div>

    <div class="flex flex-wrap gap-x-32 gap-y-4">
      <div>
        <div class="text-sm text-secondary">{translate('workers.slots')}</div>
        <div class="flex items-baseline gap-4">
          <p class="font-mono text-3xl font-semibold text-blue-500">
            {slots.currentUsedSlots ?? 0}
          </p>
          <p class="font-mono text-3xl font-semibold">
            {#if slots.currentAvailableSlots}
              {slots.currentAvailableSlots - slots.currentUsedSlots || 0}
            {:else}
              -
            {/if}
          </p>
        </div>
        <div class="flex gap-2 text-xs text-secondary">
          <p>{translate('workers.used')}</p>
          <p>
            {#if slots.currentAvailableSlots}
              {translate('workers.available-out-of', {
                count: slots.currentAvailableSlots,
              })}
            {:else}
              {translate('workers.none-available')}
            {/if}
          </p>
        </div>
      </div>

      <div>
        <div class="text-sm text-secondary">
          {translate('workers.tasks-processed')}
        </div>
        <span class="font-mono text-3xl font-semibold">
          {(slots.totalProcessedTasks ?? 0).toLocaleString()}
        </span>
      </div>

      {#if poller}
        <div>
          <div class="flex items-center gap-2 text-sm text-secondary">
            Poller
            <Badge type="ghost" class="text-xs">
              {poller.isAutoscaling ? 'Autoscaling' : 'Manual'}
            </Badge>
          </div>
          <span class="font-mono text-3xl font-semibold">
            {poller.currentPollers ?? 0}
          </span>
          <div class="text-xs text-secondary">
            {#if poller.lastSuccessfulPollTime}
              {translate('workers.last-poll')}
              <Timestamp dateTime={poller.lastSuccessfulPollTime} as="span" />
            {:else}
              {translate('workers.no-activity')}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </Card>
{/snippet}

{#snippet hostInfo()}
  <Card>
    <h3 class="mb-3 text-base font-medium">{translate('workers.host-info')}</h3>
    <div class="flex flex-col gap-2 text-sm">
      <div class="flex items-start justify-between gap-2">
        <span class="text-secondary">{translate('workers.host-name')}</span>
        <span class="break-all text-right font-mono text-xs">
          {heartbeat?.hostInfo?.hostName}
        </span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-secondary">{translate('workers.process-id')}</span>
        <span class="font-mono text-xs">{heartbeat?.hostInfo?.processId}</span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-secondary">{translate('workers.instance')}</span>
        <span class="break-all text-right font-mono text-xs">
          {heartbeat?.workerInstanceKey}
        </span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-secondary"
          >{translate('workers.worker-grouping')}</span
        >
        <span class="break-all text-right font-mono text-xs">
          {heartbeat?.hostInfo?.workerGroupingKey}
        </span>
      </div>
    </div>
  </Card>
{/snippet}

{#snippet hostUsage()}
  <Card>
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-base font-medium">{translate('workers.host-usage')}</h3>
    </div>
    <div class="flex flex-col gap-3">
      <div>
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="flex items-center gap-1">
            <Icon name="usage" class="h-3 w-3 text-secondary" />
            {translate('workers.cpu-usage')}
          </span>
          <span>{heartbeat?.hostInfo?.currentHostCpuUsage.toFixed(0)}%</span>
        </div>
        <div class="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900">
          <div
            class="h-2 min-w-2 rounded-full bg-blue-500"
            style="width: {Math.min(
              heartbeat?.hostInfo?.currentHostCpuUsage,
              100,
            )}%"
          ></div>
        </div>
      </div>
      <div>
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="flex items-center gap-1">
            <Icon name="server" class="h-3 w-3 text-secondary" />
            {translate('workers.memory-usage')}
          </span>
          <span>{heartbeat?.hostInfo?.currentHostMemUsage.toFixed(0)}%</span>
        </div>
        <div class="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900">
          <div
            class="h-2 min-w-2 rounded-full bg-blue-500"
            style="width: {Math.min(
              heartbeat?.hostInfo?.currentHostMemUsage,
              100,
            )}%"
          ></div>
        </div>
      </div>
    </div>
  </Card>
{/snippet}

{#snippet workflowCache()}
  <Card>
    <h3 class="mb-3 text-base font-medium">
      {translate('workers.workflow-cache')}
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <span class="font-mono text-2xl font-semibold">
          {currentStickyCacheSize.toLocaleString()}
        </span>
        <div class="text-xs text-secondary">
          {translate('workers.cache-size')}
        </div>
      </div>
      <div>
        <span class="font-mono text-2xl font-semibold">
          {cacheHitRate}%
        </span>
        <div class="text-xs text-secondary">
          {translate('workers.cache-hits')}
        </div>
      </div>
    </div>
    <div class="mt-3">
      <span class="font-mono text-2xl font-semibold">
        {totalStickyCacheHit.toLocaleString()}
      </span>
      <div class="text-xs text-secondary">
        {translate('workers.active-thread-count')}
      </div>
    </div>
  </Card>
{/snippet}

{#snippet diagnostics()}
  <Card>
    <h3 class="mb-3 text-base font-medium">
      {translate('workers.diagnostics')}
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <span class="font-mono text-2xl font-semibold">
          {cacheHitRate}%
        </span>
        <div class="text-xs text-secondary">
          {translate('workers.poll-success-rate')}
        </div>
      </div>
      <div>
        <span class="font-mono text-2xl font-semibold"
          >{translate('common.none')}</span
        >
        <div class="text-xs text-secondary">
          {translate('workers.rate-limit')}
        </div>
      </div>
    </div>
  </Card>
{/snippet}
