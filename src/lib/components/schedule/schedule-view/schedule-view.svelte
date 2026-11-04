<script lang="ts">
  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import {
    DetailList,
    DetailListLabel,
    DetailListTimestampValue,
  } from '$lib/components/detail-list';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { BadgeStatus } from '$lib/io/badge-status';
  import { IconChevronLeft } from '$lib/io/icon';
  import { coreUserStore } from '$lib/stores/core-user';
  import { openConfirmationModal } from '$lib/stores/schedules';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import {
    routeForScheduleEdit,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import ScheduleActionModals from '../schedule-action-modals/schedule-action-modals.svelte';
  import { scheduledActionPresentations } from '../scheduled-action-types/presentation-registry';
  import { resolveScheduledAction } from '../scheduled-action-types/resolve-scheduled-action';

  import AdvancedSettingsCard from './advanced-settings-card.svelte';
  import CustomSearchAttributesCard from './custom-search-attributes-card.svelte';
  import ScheduleSpecCard from './schedule-spec-card.svelte';

  interface Props {
    schedule: DescribeFullSchedule;
    namespace: string;
    scheduleId: string;
  }

  let { schedule, namespace, scheduleId }: Props = $props();

  const resolvedAction = $derived(resolveScheduledAction(schedule));

  const coreUser = coreUserStore();
  const editDisabled = $derived(
    $coreUser.namespaceWriteDisabled(namespace) || !writeActionsAreAllowed(),
  );
</script>

<header class="mb-2 flex flex-col gap-4">
  <Link href={routeForSchedules({ namespace })} LeadingIcon={IconChevronLeft}>
    {translate('schedules.back-to-schedules')}
  </Link>
  <div class="flex items-start justify-between gap-4">
    <h1
      class="flex flex-wrap items-center gap-2 text-3xl"
      data-testid="schedule-name"
    >
      <BadgeStatus
        status={schedule?.schedule?.state?.paused ? 'Paused' : 'Running'}
        data-testid="schedule-status"
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
      onclick={() => openConfirmationModal('pause')}
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
    {#if resolvedAction.type !== 'unknown' && resolvedAction.schedule}
      {@const presentation = scheduledActionPresentations[resolvedAction.type]}
      <presentation.view.Details
        schedule={resolvedAction.schedule}
        {namespace}
        {scheduleId}
      />
    {/if}

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

  {#if resolvedAction.type !== 'unknown' && resolvedAction.schedule}
    {@const presentation = scheduledActionPresentations[resolvedAction.type]}
    <presentation.view.Header
      schedule={resolvedAction.schedule}
      {namespace}
      {scheduleId}
    />
  {/if}
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
      {#if resolvedAction.type !== 'unknown' && resolvedAction.schedule}
        {@const presentation =
          scheduledActionPresentations[resolvedAction.type]}
        <presentation.view.RunsCard
          schedule={resolvedAction.schedule}
          {namespace}
          {scheduleId}
          openTriggerConfirmationModal={() => openConfirmationModal('trigger')}
          openBackfillConfirmationModal={() =>
            openConfirmationModal('backfill')}
        />
      {/if}
      <AdvancedSettingsCard {schedule}>
        {#if resolvedAction.type !== 'unknown' && resolvedAction.schedule}
          {@const presentation =
            scheduledActionPresentations[resolvedAction.type]}
          <presentation.view.AdvancedSettings
            schedule={resolvedAction.schedule}
            {namespace}
            {scheduleId}
          />
        {/if}
      </AdvancedSettingsCard>
      <CustomSearchAttributesCard {schedule} {resolvedAction} />
    </div>

    <div class="flex w-full flex-col gap-4 xl:w-1/3">
      {#if resolvedAction.type !== 'unknown' && resolvedAction.schedule}
        {@const presentation =
          scheduledActionPresentations[resolvedAction.type]}
        <presentation.view.InputCard
          schedule={resolvedAction.schedule}
          {namespace}
          {scheduleId}
        />
      {/if}
      <ScheduleSpecCard {schedule} />
    </div>
  </div>
</div>
<ScheduleActionModals {schedule} {namespace} {scheduleId} />
