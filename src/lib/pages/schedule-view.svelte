<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';
  import ScheduleFrequencyPanel from '$lib/components/schedule/schedule-frequency-panel.svelte';
  import ScheduleRecentRuns from '$lib/components/schedule/schedule-recent-runs.svelte';
  import ScheduleUpcomingRuns from '$lib/components/schedule/schedule-upcoming-runs.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import { createTranslate, translate } from '$lib/i18n/translate';
  import {
    deleteSchedule,
    fetchSchedule,
    pauseSchedule,
    unpauseSchedule,
  } from '$lib/services/schedule-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import { loading } from '$lib/stores/schedules';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    routeForScheduleEdit,
    routeForSchedules,
  } from '$lib/utilities/route-for';

  import type { DescribeScheduleResponse } from '$types';

  const t = createTranslate('schedules');
  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;
  const parameters = {
    namespace,
    scheduleId: decodeURIForSvelte(scheduleId),
  };

  let scheduleFetch = fetchSchedule(parameters);

  let pauseConfirmationModalOpen = false;
  let deleteConfirmationModalOpen = false;
  let reason = '';
  let error = '';

  let coreUser = coreUserStore();
  let editDisabled = $coreUser.namespaceWriteDisabled(namespace);

  const handleDelete = async () => {
    error = '';
    try {
      $loading = true;
      await deleteSchedule({ namespace, scheduleId });
      deleteConfirmationModalOpen = false;
      setTimeout(() => {
        $loading = false;
        goto(routeForSchedules({ namespace }));
      }, 2000);
      reason = '';
    } catch (e) {
      error = t('delete-schedule-error', {
        error: e?.message,
      });
      $loading = false;
    }
  };

  const handlePause = async (schedule: DescribeScheduleResponse) => {
    schedule?.schedule?.state?.paused
      ? await unpauseSchedule({
          namespace,
          scheduleId,
          reason,
        })
      : await pauseSchedule({
          namespace,
          scheduleId,
          reason,
        });
    scheduleFetch = fetchSchedule(parameters, fetch);
    reason = '';
    pauseConfirmationModalOpen = false;
  };

  const resetReason = () => {
    reason = '';
  };
</script>

{#await scheduleFetch}
  <header class="mb-8">
    <div class="relative flex flex-col gap-1">
      <Link
        on:click={() => {
          goto(routeForSchedules({ namespace }));
        }}
        icon="chevron-left"
      >
        {t('back-to-schedules')}
      </Link>
      <h1
        class="mt-8 select-all text-2xl font-medium"
        data-testid="schedule-name"
      >
        {scheduleId}
      </h1>
      <p class="text-sm">
        {namespace}
      </p>
    </div>
  </header>
  <Loading />
{:then schedule}
  {#if $loading}
    <Loading title={t('deleting')} class="my-2" />
  {:else}
    <header class="mb-8 flex flex-row justify-between gap-4">
      <div class="relative flex flex-col gap-1">
        <Link
          on:click={() => {
            goto(routeForSchedules({ namespace }));
          }}
          icon="chevron-left"
        >
          {t('back-to-schedules')}
        </Link>
        <h1 class="relative mt-8 flex items-center gap-4 text-2xl">
          <WorkflowStatus
            status={schedule?.schedule.state.paused ? 'Paused' : 'Running'}
          />
          <span class="select-all font-medium" data-testid="schedule-name">
            {scheduleId}
          </span>
        </h1>
        <div class="flex items-center gap-2 text-sm">
          <p>
            {namespace}
          </p>
          <div class="h-1 w-1 rounded-full bg-gray-900" />
          <p>
            {schedule?.schedule?.action?.startWorkflow?.workflowType?.name}
          </p>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <p>
            {translate('created', {
              created: formatDate(schedule?.info?.createTime, $timeFormat, {
                relative: $relativeTime,
              }),
            })}
          </p>
        </div>
        {#if schedule?.info?.updateTime}
          <div class="flex items-center gap-2 text-sm">
            <p>
              {translate('last-updated', {
                updated: formatDate(schedule?.info?.updateTime, $timeFormat, {
                  relative: $relativeTime,
                }),
              })}
            </p>
          </div>
        {/if}
      </div>
      <SplitButton
        position="right"
        label={schedule?.schedule?.state?.paused ? t('unpause') : t('pause')}
        menuLabel={t('schedule-actions')}
        id="schedule-actions"
        disabled={editDisabled}
        on:click={() => (pauseConfirmationModalOpen = true)}
      >
        <MenuItem
          data-testid="edit-schedule"
          href={routeForScheduleEdit({ namespace, scheduleId })}
        >
          {translate('edit')}
        </MenuItem>
        <MenuItem
          data-testid="delete-schedule"
          destructive
          on:click={() => (deleteConfirmationModalOpen = true)}
        >
          {translate('delete')}
        </MenuItem>
      </SplitButton>
    </header>
    <div class="flex flex-col gap-4 pb-24">
      {#if schedule?.info?.invalidScheduleError}
        <div class="w-full xl:w-1/2">
          <ScheduleError error={schedule?.info?.invalidScheduleError} />
        </div>
      {/if}
      <div class="flex flex-col gap-4 xl:flex-row">
        <div class="flex w-full flex-col items-start gap-4 xl:w-2/3">
          <ScheduleRecentRuns
            {namespace}
            recentRuns={schedule?.info?.recentActions}
          />
          <ScheduleUpcomingRuns
            futureRuns={schedule?.info?.futureActionTimes}
          />
          <ScheduleAdvancedSettings
            spec={schedule?.schedule?.spec}
            state={schedule?.schedule?.state}
            policies={schedule?.schedule?.policies}
            notes={schedule?.schedule?.state?.notes}
          />
        </div>
        <div class="w-full xl:w-1/3">
          <ScheduleFrequencyPanel
            calendar={schedule?.schedule?.spec?.structuredCalendar?.[0]}
            interval={schedule?.schedule?.spec?.interval?.[0]}
          />
        </div>
      </div>
    </div>
    <Modal
      id="pause-schedule-modal"
      bind:open={pauseConfirmationModalOpen}
      confirmType="primary"
      confirmText={schedule?.schedule.state.paused ? t('unpause') : t('pause')}
      cancelText={translate('cancel')}
      confirmDisabled={!reason}
      on:confirmModal={() => handlePause(schedule)}
      on:cancelModal={resetReason}
    >
      <h3 slot="title">
        {schedule?.schedule.state.paused
          ? t('unpause-modal-title')
          : t('pause-modal-title')}
      </h3>
      <div slot="content">
        <p>
          {schedule?.schedule.state.paused
            ? t('unpause-modal-confirmation', {
                schedule: scheduleId,
              })
            : t('pause-modal-confirmation', {
                schedule: scheduleId,
              })}
        </p>
        <p class="my-4">
          {schedule?.schedule.state.paused
            ? t('unpause-reason')
            : t('pause-reason')}
        </p>
        <input
          class="mt-4 block w-full rounded-md border border-gray-200 p-2"
          placeholder={translate('reason')}
          bind:value={reason}
          on:keydown|stopPropagation
        />
      </div>
    </Modal>
    <Modal
      id="delete-schedule-modal"
      bind:open={deleteConfirmationModalOpen}
      bind:error
      confirmType="destructive"
      confirmText={translate('delete')}
      cancelText={translate('cancel')}
      on:confirmModal={handleDelete}
      on:cancelModal={resetReason}
    >
      <h3 slot="title">{t('delete-modal-title')}</h3>
      <div slot="content">
        <p>
          {t('delete-modal-confirmation', {
            schedule: scheduleId,
          })}
        </p>
      </div>
    </Modal>
  {/if}
{:catch error}
  <header class="mb-8">
    <div class="relative flex flex-col gap-1">
      <Link
        on:click={() => {
          goto(routeForSchedules({ namespace }));
        }}
        icon="chevron-left"
      >
        {t('back-to-schedules')}
      </Link>
      <h1
        class="mt-8 select-all text-2xl font-medium"
        data-testid="schedule-name"
      >
        {scheduleId}
      </h1>
      <p class="text-sm">
        {namespace}
      </p>
    </div>
  </header>
  <ScheduleError error={error?.message} />
{/await}
