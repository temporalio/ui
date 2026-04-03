<script lang="ts">
  import type { Snippet } from 'svelte';

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
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    WorkerInfo,
    WorkerPollerInfo,
    WorkerSlotsInfo,
  } from '$lib/types';
  import { formatSDKName } from '$lib/utilities/get-sdk-version';
  import { routeForWorkersWithQuery } from '$lib/utilities/route-for';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  type Props = {
    breadcrumb: Snippet;
    worker: WorkerInfo | null | undefined;
  };

  let { breadcrumb, worker }: Props = $props();

  const { namespace } = $derived(page.params);
  const heartbeat = $derived(worker?.workerHeartbeat);
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
    if (total === 0) return '0';
    return ((totalStickyCacheHit / total) * 100).toFixed(1);
  });
  const taskSuccessRate = $derived.by(() => {
    if (!heartbeat?.workflowTaskSlotsInfo?.totalProcessedTasks) return '0';
    const successCount =
      heartbeat.workflowTaskSlotsInfo.totalProcessedTasks -
      (heartbeat.workflowTaskSlotsInfo.totalFailedTasks ?? 0);
    return (
      (successCount / heartbeat.workflowTaskSlotsInfo.totalProcessedTasks) *
      100
    ).toFixed(1);
  });

  const SupplierKindTooltipText: Record<string, string> = {
    Fixed: translate('workers.slot-supplier-kind-fixed'),
    ResourceBased: translate('workers.slot-supplier-kind-resource-based'),
    Custom: translate('workers.slot-supplier-kind-custom'),
  };
</script>

<div class="flex items-center gap-2">
  {@render breadcrumb()}
  {#if heartbeat?.workerInstanceKey}
    <Icon name="chevron-left" />
    {heartbeat.workerInstanceKey}
  {/if}
</div>

<section
  aria-label={translate('workers.worker-details')}
  class="flex flex-col gap-4"
>
  <header
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
        content={heartbeat?.workerInstanceKey ?? ''}
        clickAllToCopy
        container-class="w-full"
        class="overflow-hidden text-ellipsis text-left"
      />
    </h1>
  </header>

  <DetailList aria-label="worker details" rowCount={2}>
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
      <DetailListLabel>{translate('common.start')}</DetailListLabel>
      <DetailListTextValue
        text={heartbeat?.startTime ? $timestamp(heartbeat?.startTime) : '-'}
        tooltipText={$timestamp(heartbeat?.startTime, {
          relative: true,
        })}
      />
    </DetailListColumn>

    <DetailListColumn>
      {#if heartbeat?.taskQueue}
        <DetailListLabel>{translate('common.task-queue')}</DetailListLabel>
        <DetailListLinkValue
          copyable
          text={heartbeat.taskQueue}
          href={routeForWorkersWithQuery({
            namespace,
            query: `TaskQueue="${heartbeat.taskQueue}"`,
          }) ?? ''}
          iconName="filter"
        />
      {/if}
      <DetailListLabel>{translate('workers.sdk')}</DetailListLabel>
      <DetailListValue>
        <SdkLogo
          sdk={formatSDKName(heartbeat?.sdkName)}
          version={heartbeat?.sdkVersion ?? ''}
        />
      </DetailListValue>
    </DetailListColumn>

    <DetailListColumn>
      <!-- TODO: Make filterable link for Build ID with DT-3745 -->
      <DetailListLabel>{translate('deployments.build-id')}</DetailListLabel>
      {@const buildId = heartbeat?.deploymentVersion?.buildId}
      <span class="max-w-72">
        <DetailListTextValue
          copyable={!!buildId}
          copyableText={buildId ?? ''}
          text={buildId ?? '-'}
          tooltipText={buildId}
        />
      </span>
      {#if heartbeat?.deploymentVersion?.deploymentName}
        <DetailListLabel>{translate('deployments.deployment')}</DetailListLabel>
        <DetailListLinkValue
          copyable
          text={heartbeat.deploymentVersion.deploymentName}
          href={routeForWorkersWithQuery({
            namespace,
            query: `DeploymentName="${heartbeat.deploymentVersion.deploymentName}"`,
          }) ?? ''}
          iconName="filter"
        />
      {/if}
    </DetailListColumn>
  </DetailList>

  <div class="flex flex-col gap-4 lg:flex-row">
    <section class="flex flex-1 flex-col gap-4">
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
    </section>

    <aside class="flex w-full flex-col gap-4 lg:w-fit">
      {@render hostInfo()}
      {@render workflowCache()}
      {@render diagnostics()}
    </aside>
  </div>
</section>

{#snippet taskSlotCard(
  title: string,
  slots: WorkerSlotsInfo | null | undefined,
  poller: WorkerPollerInfo | null | undefined,
)}
  <Card>
    <div class="mb-4 flex items-center gap-2">
      <h3 class="text-base font-medium">{title}</h3>
    </div>

    <dl class="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:grid-rows-1">
      <div>
        <dt
          id="slots-{title}"
          class="mb-1 flex h-6 items-center gap-2 text-sm text-secondary"
        >
          {translate('workers.slots')}
          {#if slots?.slotSupplierKind}
            {@const tooltipText =
              SupplierKindTooltipText[slots.slotSupplierKind]}
            <Tooltip topLeft text={tooltipText} hide={!tooltipText}>
              <Badge type="ghost" class="text-xs"
                >{slots.slotSupplierKind}</Badge
              >
            </Tooltip>
          {/if}
        </dt>
        <dd class="mb-2">
          <div class="flex items-baseline gap-12">
            <div>
              <p class="truncate font-mono text-2xl font-semibold text-brand">
                {slots?.currentUsedSlots ?? 0}
              </p>
              <p class="text-xs text-secondary">{translate('workers.used')}</p>
            </div>
            <div>
              <p class="truncate font-mono text-2xl font-semibold">
                {#if slots?.currentAvailableSlots}
                  {slots.currentAvailableSlots - (slots?.currentUsedSlots ?? 0)}
                {:else}
                  -
                {/if}
              </p>
              <p class="text-xs text-secondary">
                {#if slots?.currentAvailableSlots}
                  {translate('workers.available-out-of', {
                    count: slots.currentAvailableSlots,
                  })}
                {:else}
                  {translate('workers.none-available')}
                {/if}
              </p>
            </div>
          </div>
        </dd>
      </div>

      <div>
        <dt class="mb-1 flex h-6 items-center text-sm text-secondary">
          {translate('workers.tasks-processed')}
        </dt>
        <dd class="font-mono text-2xl font-semibold">
          {(slots?.totalProcessedTasks ?? 0).toLocaleString()}
        </dd>
      </div>

      {#if poller}
        <div>
          <dt class="mb-1 flex h-6 items-center gap-2 text-sm text-secondary">
            {translate('workers.poller')}
            <Tooltip
              topLeft
              text={poller.isAutoscaling
                ? translate('workers.autoscaling-poller')
                : translate('workers.manual-poller')}
            >
              <Badge type="ghost" class="text-xs">
                {poller.isAutoscaling ? 'Autoscaling' : 'Manual'}
              </Badge>
            </Tooltip>
          </dt>
          <dd>
            <p class="font-mono text-2xl font-semibold">
              {poller.currentPollers ?? 0}
            </p>
            <p class="text-xs text-secondary">
              {#if poller.lastSuccessfulPollTime}
                {translate('workers.last-poll')}
                <Timestamp dateTime={poller.lastSuccessfulPollTime} as="span" />
              {:else}
                {translate('workers.no-activity')}
              {/if}
            </p>
          </dd>
        </div>
      {/if}
    </dl>
  </Card>
{/snippet}

{#snippet meterBar(labelledby: string, value: number, maxValue: number = 100)}
  <div
    role="meter"
    aria-labelledby={labelledby}
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={maxValue}
    class="relative h-2 w-full overflow-hidden rounded bg-indigo-100"
  >
    <div
      class="absolute left-0 h-full bg-indigo-600"
      style="width:{maxValue > 0
        ? Math.min((value / maxValue) * 100, 100)
        : 0}%;"
    ></div>
  </div>
{/snippet}

{#snippet goDependencyWarning()}
  <Alert
    class="max-w-96"
    intent="warning"
    title={translate('workers.go-dependency-warning')}
  >
    <p class="mb-1">{translate('workers.go-dependency-warning-description')}</p>
    <Link
      icon="external-link"
      href="https://docs.temporal.io/cloud/worker-health#enable-host-resource-reporting"
      newTab
    >
      {translate('workers.go-dependency-warning-link')}
    </Link>
  </Alert>
{/snippet}

{#snippet hostUsage()}
  {@const cpuUsage = (heartbeat?.hostInfo?.currentHostCpuUsage ?? 0) * 100}
  {@const memUsage = (heartbeat?.hostInfo?.currentHostMemUsage ?? 0) * 100}
  <Card class="flex flex-col gap-2 border-t-0">
    <div>
      <div class="mb-1 flex items-center justify-between text-sm">
        <span id="cpu-label" class="flex items-center gap-1 font-semibold">
          <Icon name="microchip" class="h-3 w-3 text-secondary" />
          {translate('workers.cpu-usage')}
        </span>
        <span>{cpuUsage.toFixed(0)}%</span>
      </div>
      {@render meterBar('cpu-label', cpuUsage)}
    </div>
    <div>
      <div class="mb-1 flex items-center justify-between text-sm">
        <span id="memory-label" class="flex items-center gap-1 font-semibold">
          <Icon name="server" class="h-3 w-3 text-secondary" />
          {translate('workers.memory-usage')}
        </span>
        <span>{memUsage.toFixed(0)}%</span>
      </div>
      {@render meterBar('memory-label', memUsage)}
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
        <dd class="select-all">{heartbeat?.hostInfo?.hostName ?? '-'}</dd>

        <dt class="mt-2 text-secondary">{translate('workers.process-id')}</dt>
        <dd class="select-all">{heartbeat?.hostInfo?.processId ?? '-'}</dd>
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
    <dl class="grid grid-cols-2 gap-4">
      <div>
        <dd class="font-mono text-2xl font-semibold">
          {currentStickyCacheSize.toLocaleString()}
        </dd>
        <dt class="text-sm text-secondary">
          {translate('workers.cache-size')}
        </dt>
      </div>
      <div>
        <dd class="font-mono text-2xl font-semibold">
          {cacheHitRate}%
        </dd>
        <dt class="text-sm text-secondary">
          {translate('workers.cache-hits')}
        </dt>
      </div>
    </dl>
  </Card>
{/snippet}

{#snippet diagnostics()}
  <Card>
    <h3 class="mb-4 text-base font-medium">
      {translate('workers.diagnostics')}
    </h3>
    <dl>
      <dd class="font-mono text-2xl">{taskSuccessRate}%</dd>
      <dt class="text-sm text-secondary">
        {translate('workers.task-success-rate')}
      </dt>
    </dl>
  </Card>
{/snippet}
