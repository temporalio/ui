<script lang="ts">
  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import CountRefreshButton from '$lib/components/count-refresh-button.svelte';
  import {
    DetailList,
    DetailListLabel,
    DetailListTimestampValue,
  } from '$lib/components/detail-list';
  import DetailListLinkValue from '$lib/components/detail-list/detail-list-link-value.svelte';
  import StatusCounts from '$lib/components/status-counts.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { coreUserStore } from '$lib/stores/core-user';
  import {
    openConfirmationModal,
    refreshCurrentScheduleFetch,
  } from '$lib/stores/schedules';
  import {
    workflowCount,
    refresh as workflowRefresh,
  } from '$lib/stores/workflows';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import {
    routeForScheduleEdit,
    routeForSchedules,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import ScheduleActionModals from '../schedule-action-modals/schedule-action-modals.svelte';

  import AdvancedSettingsCard from './advanced-settings-card.svelte';
  import CustomSearchAttributesCard from './custom-search-attributes-card.svelte';
  import ScheduleSpecCard from './schedule-spec-card.svelte';
  import WorkflowInputCard from './workflow-input-card.svelte';
  import WorkflowRunsCard from './workflow-runs-card.svelte';

  interface Props {
    schedule: DescribeFullSchedule;
    namespace: string;
    scheduleId: string;
  }

  let { schedule, namespace, scheduleId }: Props = $props();

  const workflowQuery = $derived(`TemporalScheduledById="${scheduleId}"`);

  const coreUser = coreUserStore();
  const editDisabled = $derived(
    $coreUser.namespaceWriteDisabled(namespace) || !writeActionsAreAllowed(),
  );
</script>

<header class="mb-2 flex flex-col gap-4">
  <Link href={routeForSchedules({ namespace })} icon="chevron-left">
    {translate('schedules.back-to-schedules')}
  </Link>
  <div class="flex items-start justify-between gap-4">
    <h1
      class="flex flex-wrap items-center gap-2 text-3xl"
      data-testid="schedule-name"
    >
      <WorkflowStatus
        status={schedule?.schedule?.state?.paused ? 'Paused' : 'Running'}
      />
      <span class="select-all">
        {scheduleId}
      </span>
    </h1>

    <SplitButton
      position="right"
      label={schedule?.schedule?.state?.paused
        ? translate('schedules.unpause')
        : translate('schedules.pause')}
      menuLabel={translate('schedules.schedule-actions')}
      id="schedule-actions"
      disabled={editDisabled}
      on:click={() => openConfirmationModal('pause')}
    >
      <MenuItem
        data-testid="trigger-schedule"
        onclick={() => openConfirmationModal('trigger')}
      >
        {translate('schedules.trigger')}
      </MenuItem>
      <MenuItem
        data-testid="backfill-schedule"
        onclick={() => openConfirmationModal('backfill')}
      >
        {translate('schedules.backfill')}
      </MenuItem>
      <MenuItem
        data-testid="edit-schedule"
        href={routeForScheduleEdit({ namespace, scheduleId })}
      >
        {translate('common.edit')}
      </MenuItem>
      <MenuItem
        data-testid="delete-schedule"
        destructive
        onclick={() => openConfirmationModal('delete')}
      >
        {translate('common.delete')}
      </MenuItem>
    </SplitButton>
  </div>

  <DetailList rowCount={3}>
    <DetailListLabel class="flex min-h-6 items-center"
      >{translate('common.workflow-type')}</DetailListLabel
    >
    <DetailListLinkValue
      href={routeForWorkflowsWithQuery({
        namespace,
        query: [
          `WorkflowType="${
            schedule?.schedule?.action?.startWorkflow?.workflowType?.name
          }"`,
          `TemporalScheduledById="${scheduleId}"`,
        ].join(' AND '),
      }) ?? ''}
      text={schedule?.schedule?.action?.startWorkflow?.workflowType?.name ?? ''}
      iconName="filter"
      copyable={Boolean(
        schedule?.schedule?.action?.startWorkflow?.workflowType?.name,
      )}
      copyableText={schedule?.schedule?.action?.startWorkflow?.workflowType
        ?.name ?? undefined}
    />

    <DetailListLabel class="items-center">
      {translate('common.created-label')}
    </DetailListLabel>
    <DetailListTimestampValue timestamp={schedule?.info?.createTime} />

    {#if schedule?.info?.updateTime}
      <DetailListLabel>
        {translate('common.last-updated-label')}
      </DetailListLabel>
      <DetailListTimestampValue timestamp={schedule?.info?.updateTime} />
    {/if}
  </DetailList>

  <dl class="-mt-2 flex flex-col gap-1">
    <dt class="text-secondary">
      {translate('workflows.total-workflows')}
    </dt>
    <dd class="flex flex-wrap items-center gap-2">
      <span class="font-mono" data-testid="workflow-count"
        >{$workflowCount.count.toLocaleString()}
      </span>
      <CountRefreshButton
        refresh={workflowRefresh}
        count={$workflowCount.newCount}
        onRefresh={() => {
          refreshCurrentScheduleFetch({ namespace, scheduleId });
        }}
      />
      <StatusCounts class="p-0" staticQuery={workflowQuery} />
    </dd>
  </dl>
</header>
<CodecServerErrorBanner />
<div class="flex flex-col gap-4 pb-24">
  {#if schedule?.info?.invalidScheduleError}
    <div class="w-full xl:w-1/2">
      <Alert intent="error">
        <p>{translate('schedules.error-title')}</p>
        <p>
          {schedule?.info?.invalidScheduleError}
        </p>
      </Alert>
    </div>
  {/if}
  <div class="flex flex-col gap-4 xl:flex-row">
    <div class="flex w-full flex-col items-start gap-4 xl:w-2/3">
      <WorkflowRunsCard
        {namespace}
        {schedule}
        {workflowQuery}
        openTriggerConfirmationModal={() => openConfirmationModal('trigger')}
        openBackfillConfirmationModal={() => openConfirmationModal('backfill')}
      />
      <AdvancedSettingsCard {schedule} />
      <CustomSearchAttributesCard {schedule} />
    </div>

    <div class="flex w-full flex-col gap-4 xl:w-1/3">
      <WorkflowInputCard
        {scheduleId}
        input={schedule?.schedule?.action?.startWorkflow?.input ?? undefined}
      />
      <ScheduleSpecCard {schedule} />
    </div>
  </div>
</div>
<ScheduleActionModals {schedule} {namespace} {scheduleId} />
