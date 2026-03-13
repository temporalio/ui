<script lang="ts">
  import { page } from '$app/state';

  import DetailListColumn from '$lib/components/detail-list/detail-list-column.svelte';
  import DetailListLabel from '$lib/components/detail-list/detail-list-label.svelte';
  import DetailListLinkValue from '$lib/components/detail-list/detail-list-link-value.svelte';
  import DetailListTextValue from '$lib/components/detail-list/detail-list-text-value.svelte';
  import DetailListValue from '$lib/components/detail-list/detail-list-value.svelte';
  import DetailList from '$lib/components/detail-list/detail-list.svelte';
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkerStatus from '$lib/components/workers/worker-status.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    WorkerInfo,
    WorkerPollerInfo,
    WorkerSlotsInfo,
  } from '$lib/types';
  import { formatSDKName } from '$lib/utilities/get-sdk-version';
  import { routeForTaskQueue } from '$lib/utilities/route-for';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

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
  const isGoSdk = $derived(heartbeat?.sdkName?.startsWith('temporal-go'));
  const goDependencyPotentiallyMissing = $derived(
    isGoSdk
      ? !heartbeat?.hostInfo?.currentHostCpuUsage &&
          !heartbeat?.hostInfo?.currentHostMemUsage
      : false,
  );

  const cacheHitRate = $derived.by(() => {
    const total = totalStickyCacheHit + totalStickyCacheMiss;
    if (total === 0) return 0;
    return ((totalStickyCacheHit / total) * 100).toFixed(1);
  });
  const pollSuccessRate = $derived.by(() => {
    if (!heartbeat?.workflowTaskSlotsInfo?.totalProcessedTasks) return 0;
    const successCount =
      heartbeat.workflowTaskSlotsInfo.totalProcessedTasks -
      (heartbeat.workflowTaskSlotsInfo.totalFailedTasks ?? 0);
    return (
      (successCount / heartbeat.workflowTaskSlotsInfo.totalProcessedTasks) *
      100
    ).toFixed(1);
  });
</script>

<div class="flex flex-col gap-4">
  <div
    class="flex w-full flex-col items-start gap-4 xl:flex-row xl:items-center"
  >
    <WorkerStatus {status} />
    <h1
      data-testid="worker-instance-key"
      class="gap-0 overflow-hidden max-sm:text-xl sm:max-md:text-2xl"
    >
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={heartbeat?.workerInstanceKey}
        clickAllToCopy
        container-class="w-full"
        class="overflow-hidden text-ellipsis text-left"
      />
    </h1>
  </div>

  <DetailList aria-label="worker details" rowCount={1}>
    <DetailListColumn>
      <DetailListLabel>{translate('workflows.last-heartbeat')}</DetailListLabel>
      <DetailListTextValue
        text={heartbeat?.heartbeatTime
          ? $timestamp(heartbeat?.heartbeatTime)
          : '-'}
        tooltipText={$timestamp(heartbeat?.heartbeatTime, {
          relative: true,
        })}
      />
    </DetailListColumn>
    <DetailListColumn>
      <DetailListLabel>{translate('common.start')}</DetailListLabel>
      <DetailListTextValue
        text={heartbeat?.startTime ? $timestamp(heartbeat?.startTime) : '-'}
        tooltipText={$timestamp(heartbeat?.startTime, {
          relative: true,
        })}
      />
    </DetailListColumn>

    <DetailListColumn>
      <DetailListLabel>{translate('common.task-queue')}</DetailListLabel>
      <DetailListLinkValue
        copyable
        text={heartbeat?.taskQueue}
        href={routeForTaskQueue({
          namespace,
          queue: heartbeat?.taskQueue,
        })}
      />
    </DetailListColumn>
    <DetailListColumn>
      <DetailListLabel>{translate('workers.sdk')}</DetailListLabel>
      <DetailListValue>
        <SdkLogo
          sdk={formatSDKName(heartbeat?.sdkName)}
          version={heartbeat?.sdkVersion}
        />
      </DetailListValue>
    </DetailListColumn>
  </DetailList>

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
        <div class="flex h-6 items-center text-sm text-secondary">
          {translate('workers.slots')}
        </div>
        <div class="flex items-baseline gap-12">
          <p class="font-mono text-2xl font-semibold text-brand">
            {slots.currentUsedSlots ?? 0}
          </p>
          <p class="font-mono text-2xl font-semibold">
            {#if slots.currentAvailableSlots}
              {slots.currentAvailableSlots - slots.currentUsedSlots || 0}
            {:else}
              -
            {/if}
          </p>
        </div>
        <div class="flex gap-8 text-xs text-secondary">
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
        <div class="flex h-6 items-center text-sm text-secondary">
          {translate('workers.tasks-processed')}
        </div>
        <span class="font-mono text-2xl font-semibold">
          {(slots.totalProcessedTasks ?? 0).toLocaleString()}
        </span>
      </div>

      {#if poller}
        <div>
          <div class="flex h-6 items-center gap-2 text-sm text-secondary">
            {translate('workers.poller')}
            <Badge type="ghost" class="text-xs">
              {poller.isAutoscaling ? 'Autoscaling' : 'Manual'}
            </Badge>
          </div>
          <span class="font-mono text-2xl font-semibold">
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

{#snippet goDependencyWarning()}
  <Alert
    class="max-w-96"
    intent="warning"
    title={translate('workers.go-dependency-warning')}
  >
    <p class="mb-1">{translate('workers.go-dependency-warning-description')}</p>
    <!-- TODO: Add link when documentation is available -->
    <!-- <Link icon="external-link" href="" newTab
      >{translate('workers.go-dependency-warning-link')}</Link
    > -->
  </Alert>
{/snippet}

{#snippet hostUsage()}
  <Card class="flex flex-col gap-2 border-t-0">
    <div>
      <div class="mb-1 flex items-center justify-between text-sm">
        <span class="flex items-center gap-1 font-semibold">
          <Icon name="microchip" class="h-3 w-3 text-secondary" />
          {translate('workers.cpu-usage')}
        </span>
        <span>{heartbeat?.hostInfo?.currentHostCpuUsage.toFixed(0)}%</span>
      </div>
      <div class="relative h-2 w-full overflow-hidden rounded bg-indigo-100">
        <div
          class="absolute left-0 flex h-full items-center bg-indigo-600"
          style="width:{Math.min(
            heartbeat?.hostInfo?.currentHostCpuUsage,
            100,
          )}%;"
        ></div>
      </div>
    </div>
    <div>
      <div class="mb-1 flex items-center justify-between text-sm">
        <span class="flex items-center gap-1 font-semibold">
          <Icon name="server" class="h-3 w-3 text-secondary" />
          {translate('workers.memory-usage')}
        </span>
        <span>{heartbeat?.hostInfo?.currentHostMemUsage.toFixed(0)}%</span>
      </div>
      <div class="relative h-2 w-full overflow-hidden rounded bg-indigo-100">
        <div
          class="absolute left-0 flex h-full items-center bg-indigo-600"
          style="width:{Math.min(
            heartbeat?.hostInfo?.currentHostMemUsage,
            100,
          )}%;"
        ></div>
      </div>
    </div>
    {#if goDependencyPotentiallyMissing}
      {@render goDependencyWarning()}
    {/if}
  </Card>
{/snippet}

{#snippet hostInfo()}
  <div>
    <Card>
      <h3 class="mb-4 text-base font-medium">
        {translate('workers.host-info')}
      </h3>
      <dl>
        <dt class="text-secondary">{translate('workers.host-name')}</dt>
        <dd class="select-all">{heartbeat?.hostInfo?.hostName}</dd>

        <dt class="mt-2 text-secondary">{translate('workers.process-id')}</dt>
        <dd class="select-all">{heartbeat?.hostInfo?.processId}</dd>

        <dt class="mt-2 text-secondary">
          {translate('workers.worker-grouping')}
        </dt>
        <dd class="select-all">{heartbeat?.hostInfo?.workerGroupingKey}</dd>
      </dl>
    </Card>
    {@render hostUsage()}
  </div>
{/snippet}

{#snippet workflowCache()}
  <Card>
    <h3 class="mb-4 text-base font-medium">
      {translate('workers.workflow-cache')}
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <span class="font-mono text-2xl font-semibold">
          {currentStickyCacheSize.toLocaleString()}
        </span>
        <div class="text-sm text-secondary">
          {translate('workers.cache-size')}
        </div>
      </div>
      <div>
        <span class="font-mono text-2xl font-semibold">
          {cacheHitRate}%
        </span>
        <div class="text-sm text-secondary">
          {translate('workers.cache-hits')}
        </div>
      </div>
    </div>
  </Card>
{/snippet}

{#snippet diagnostics()}
  <Card>
    <h3 class="mb-4 text-base font-medium">
      {translate('workers.diagnostics')}
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <span class="font-mono text-2xl">{pollSuccessRate}%</span>
        <div class="text-sm text-secondary">
          {translate('workers.poll-success-rate')}
        </div>
      </div>
      <div>
        <span class="font-mono text-2xl">{translate('common.none')}</span>
        <div class="text-sm text-secondary">
          {translate('workers.rate-limit')}
        </div>
      </div>
    </div>
  </Card>
{/snippet}
