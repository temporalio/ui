<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

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
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
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
    onrefresh: () => void;
    refreshing?: boolean;
  };

  let { breadcrumb, worker, onrefresh, refreshing = false }: Props = $props();

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
    return ((totalStickyCacheHit / total) * 100).toFixed(0);
  });
  const taskFailureRate = $derived.by(() => {
    if (!heartbeat?.workflowTaskSlotsInfo?.totalProcessedTasks) return '0';
    const failureCount = heartbeat.workflowTaskSlotsInfo.totalFailedTasks ?? 0;
    return (
      (failureCount / heartbeat.workflowTaskSlotsInfo.totalProcessedTasks) *
      100
    ).toFixed(1);
  });

  let autoRefresh = $state(true);
  let lastRefresh = $state(new Date());

  $effect(() => {
    void worker;
    lastRefresh = new Date();
  });

  $effect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => onrefresh(), 60_000);
    return () => clearInterval(interval);
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
  aria-busy={refreshing}
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
      {@const buildId = heartbeat?.deploymentVersion?.buildId}
      {#if buildId}
        <DetailListLabel>{translate('deployments.build-id')}</DetailListLabel>
        <span class="max-w-72">
          <!-- TODO: Make filterable link for Build ID with DT-3745 -->
          <DetailListTextValue
            copyable={!!buildId}
            copyableText={buildId}
            text={buildId}
            tooltipText={buildId}
          />
        </span>
      {/if}
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

    <DetailListColumn>
      {@const hostName = heartbeat?.hostInfo?.hostName}
      {#if hostName}
        <DetailListLabel>{translate('workers.host-name')}</DetailListLabel>
        <DetailListLinkValue
          copyable
          text={hostName}
          href={routeForWorkersWithQuery({
            namespace,
            query: `HostName="${hostName}"`,
          }) ?? ''}
          iconName="filter"
        />
      {/if}
      {@const processId = heartbeat?.hostInfo?.processId}
      {#if processId}
        <DetailListLabel>{translate('workers.process-id')}</DetailListLabel>
        <DetailListTextValue text={processId} tooltipText={processId} />
      {/if}
    </DetailListColumn>
  </DetailList>

  <div class="flex flex-wrap items-center gap-2">
    <ToggleButtons>
      <ToggleButton
        size="xs"
        on:click={() => {
          autoRefresh = !autoRefresh;
          if (autoRefresh) onrefresh();
        }}
      >
        <span
          class="h-1.5 w-1.5 rounded-full {autoRefresh
            ? 'bg-green-600'
            : 'bg-slate-300'}"
        ></span>
        {autoRefresh
          ? translate('workers.auto-refresh-on')
          : translate('workers.auto-refresh-off')}
      </ToggleButton>
    </ToggleButtons>
    {#if refreshing}
      <p class="flex items-center gap-1">
        <Icon name="spinner" class="animate-spin text-indigo-600" />
        {translate('workers.pulling-latest-snapshot')}
      </p>
    {:else}
      <p>
        {translate('workers.last-refreshed')}: {$timestamp(lastRefresh)}
      </p>
    {/if}
  </div>

  <div class="flex flex-col gap-4 xl:flex-row">
    <section
      class="grid flex-1 grid-cols-1 gap-4 xl:self-start 2xl:grid-flow-col 2xl:grid-cols-2 2xl:grid-rows-[auto_auto]"
    >
      {@render taskSlotCard(
        translate('common.workflows-plural', { count: 1 }),
        heartbeat?.workflowTaskSlotsInfo,
        heartbeat?.workflowPollerInfo,
      )}
      {@render taskSlotCard(
        translate('workers.nexus-tasks'),
        heartbeat?.nexusTaskSlotsInfo,
        heartbeat?.nexusPollerInfo,
      )}
      {@render taskSlotCard(
        translate('common.activities-plural', { count: 1 }),
        heartbeat?.activityTaskSlotsInfo,
        heartbeat?.activityPollerInfo,
      )}
      {@render taskSlotCard(
        translate('workers.local-activities'),
        heartbeat?.localActivitySlotsInfo,
        null,
      )}
    </section>

    <aside class="flex w-full flex-col gap-4 xl:max-w-sm">
      <Card>
        {@render hostUsage()}
        <hr class="my-4 border-subtle" />
        {@render workflowCache()}
      </Card>
      <!-- TODO: Add back task failure rate. -->
      <!-- {@render diagnostics()} -->
    </aside>
  </div>
</section>

{#snippet taskSlotCard(
  title: string,
  slots: WorkerSlotsInfo | null | undefined,
  poller: WorkerPollerInfo | null | undefined,
)}
  {@const noSlotsConfigured =
    !slots?.currentUsedSlots && !slots?.currentAvailableSlots}
  <Card class="flex flex-col gap-2">
    <h5 class="mb-2">{title}</h5>
    <dl class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-1">
      <div>
        <dt id="slots-{title}" class="mb-1 h-6 text-sm text-secondary">
          {translate('workers.slots-used')}
        </dt>
        <dd>
          <p class="truncate font-mono text-lg text-secondary">
            <span class="text-2xl font-semibold text-brand">
              {#if noSlotsConfigured}
                -
              {:else}
                {slots?.currentUsedSlots ?? 0}
              {/if}
            </span>{#if slots?.currentAvailableSlots}
              /{slots.currentAvailableSlots - (slots?.currentUsedSlots ?? 0)}
            {/if}
          </p>
          {#if slots?.slotSupplierKind}
            {@const tooltipText =
              SupplierKindTooltipText[slots.slotSupplierKind]}
            <Tooltip
              topLeft
              text={tooltipText}
              hide={!tooltipText || noSlotsConfigured}
              width={200}
            >
              <Badge
                type="ghost"
                class={merge('mt-1 text-xs', noSlotsConfigured && 'invisible')}
              >
                {slots.slotSupplierKind}
              </Badge>
            </Tooltip>
          {/if}
        </dd>
      </div>
      <div>
        <dt class="mb-1 flex h-6 items-center text-sm text-secondary">
          {translate('workers.tasks-processed')}
        </dt>
        <dd class="font-mono text-2xl font-semibold text-brand">
          {slots?.totalProcessedTasks !== undefined
            ? (slots.totalProcessedTasks ?? 0).toLocaleString()
            : '-'}
        </dd>
      </div>

      {#if poller}
        {@const hasCurrentPollers = poller.currentPollers !== undefined}
        <div>
          <dt class="mb-1 h-6 text-sm text-secondary">
            {translate('workers.poller-count')}
          </dt>
          <dd>
            <p class="font-mono text-2xl font-semibold text-brand">
              {hasCurrentPollers ? (poller.currentPollers ?? 0) : '-'}
            </p>
            <Tooltip
              topLeft
              text={poller.isAutoscaling
                ? translate('workers.autoscaling-poller')
                : translate('workers.simple-maximum-poller')}
              hide={!hasCurrentPollers}
              width={200}
            >
              <Badge
                type="ghost"
                class={merge('mt-1 text-xs', !hasCurrentPollers && 'invisible')}
              >
                {poller.isAutoscaling
                  ? translate('workers.autoscaling')
                  : translate('workers.simple-maximum')}
              </Badge>
            </Tooltip>
          </dd>
        </div>
      {/if}
    </dl>
    {#if !slots?.currentUsedSlots && !slots?.currentAvailableSlots}
      <div class="flex items-end gap-1 text-sm">
        <p class="text-secondary">
          {translate('workers.zero-slots-configured')}
        </p>
        <Link
          trailingIcon="external-link"
          href="https://docs.temporal.io/develop/worker-performance#custom-slot-implementation"
          newTab
        >
          {translate('workers.configure-slots-link')}
        </Link>
      </div>
    {:else if poller?.lastSuccessfulPollTime}
      <p class="text-sm text-secondary">
        {translate('workers.last-polled')}
        <Timestamp dateTime={poller.lastSuccessfulPollTime} as="span" />
      </p>
    {/if}
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
  <Alert intent="warning" title={translate('workers.go-dependency-warning')}>
    <p class="mb-1">{translate('workers.go-dependency-warning-description')}</p>
    <Link
      trailingIcon="external-link"
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
  <div class="flex flex-col gap-2">
    <h5 class="mb-2">{translate('workers.resource-utilization')}</h5>
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
  </div>
{/snippet}

{#snippet workflowCache()}
  <div>
    <h6 class="mb-4">
      {translate('workers.workflow-cache')}
    </h6>
    <dl class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
      <div>
        <dt class="text-sm text-secondary">
          {translate('workers.cache-size')}
        </dt>
        <dd class="font-mono text-2xl font-semibold text-brand">
          {currentStickyCacheSize.toLocaleString()}
        </dd>
        <dd class="text-xs text-secondary">
          {translate('workers.cache-size-description')}
        </dd>
      </div>
      <div>
        <dt class="font-mediumtext-sm text-secondary">
          {translate('workers.cache-hits')}
        </dt>
        <dd class="font-mono text-2xl font-semibold text-brand">
          {cacheHitRate}%
        </dd>
        <dd class="text-xs text-secondary">
          {translate('workers.cache-hits-description', { hits: cacheHitRate })}
        </dd>
      </div>
    </dl>
    <Link
      trailingIcon="external-link"
      href="https://docs.temporal.io/develop/worker-performance#workflow-cache-tuning"
      newTab
      class="mt-4"
    >
      {translate('workers.workflow-cache-link')}
    </Link>
  </div>
{/snippet}

{#snippet diagnostics()}
  <Card>
    <h5 class="mb-4">
      {translate('workers.diagnostics')}
    </h5>
    <dl>
      <dt class="text-sm text-secondary">
        {translate('workers.task-failure-rate')}
      </dt>
      <dd class="font-mono text-2xl text-brand">{taskFailureRate}%</dd>
    </dl>
  </Card>
{/snippet}
