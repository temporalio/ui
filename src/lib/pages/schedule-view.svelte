<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  
  
  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';
  import ScheduleFrequencyPanel from '$lib/components/schedule/schedule-frequency-panel.svelte';
  import ScheduleMemo from '$lib/components/schedule/schedule-memo.svelte';
  import ScheduleRecentRuns from '$lib/components/schedule/schedule-recent-runs.svelte';
  import ScheduleUpcomingRuns from '$lib/components/schedule/schedule-upcoming-runs.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import { translate } from '$lib/i18n/translate';
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
      error = translate('schedules', 'delete-schedule-error', {
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
  <Loading />
{:then schedule}
  {#if $loading}
    <Loading title={translate('schedules', 'deleting')} class="my-2" />
  {:else}
    <header class="flex flex-row justify-between gap-4 mb-8">
      <div class="flex flex-col gap-1 relative">
        <a
          href={routeForSchedules({ namespace })}
          class="absolute top-0 back-to-schedules"
          style="left: -0.5rem;"
        >
          <Icon name="chevron-left" class="inline" />{translate(
            'schedules',
            'back-to-schedules',
          )}
        </a>
        <div class="flex justify-between items-center mt-8">
          <h1 class="text-2xl flex relative items-center gap-4">
            <WorkflowStatus
              status={schedule?.schedule.state.paused ? 'Paused' : 'Running'}
            />
            <p class="font-medium select-all" data-testid="schedule-name">
              {scheduleId}
            </p>
          </h1>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <p>
            {namespace}
          </p>
          <div class="w-1 h-1 rounded-full bg-gray-900" />
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
        label={schedule?.schedule?.state?.paused
          ? translate('schedules', 'unpause')
          : translate('schedules', 'pause')}
        menuLabel={translate('schedules', 'schedule-actions')}
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
          {translate('schedules', 'delete')}
        </MenuItem>
      </SplitButton>
    </header>
    <div class="flex flex-col gap-4 pb-24">
      {#if schedule?.info?.invalidScheduleError}
        <div class="w-full xl:w-1/2">
          <ScheduleError error={schedule?.info?.invalidScheduleError} />
        </div>
      {/if}
      <div class="w-full xl:w-1/2">
        <ScheduleFrequencyPanel
          calendar={schedule?.schedule?.spec?.structuredCalendar?.[0]}
          interval={schedule?.schedule?.spec?.interval?.[0]}
        />
      </div>
      <div class="flex flex-col xl:flex-row gap-4">
        <div class="w-full xl:w-3/4">
          <ScheduleRecentRuns
            {namespace}
            recentRuns={schedule?.info?.recentActions}
          />
        </div>
        <div class="w-full xl:w-1/4 xl:min-w-[320px]">
          <ScheduleUpcomingRuns
            futureRuns={schedule?.info?.futureActionTimes}
          />
        </div>
      </div>
      <div class="w-full xl:w-1/2">
        <ScheduleAdvancedSettings
          spec={schedule?.schedule?.spec}
          state={schedule?.schedule?.state}
          policies={schedule?.schedule?.policies}
        />
      </div>
      <div class="w-full xl:w-1/2">
        <ScheduleMemo notes={schedule?.schedule?.state?.notes} />
      </div>
    </div>
    <Modal
      id="pause-schedule-modal"
      bind:open={pauseConfirmationModalOpen}
      confirmType="primary"
      confirmText={schedule?.schedule.state.paused
        ? translate('schedules', 'unpause')
        : translate('schedules', 'pause')}
      cancelText={translate('cancel')}
      confirmDisabled={!reason}
      on:confirmModal={() => handlePause(schedule)}
      on:cancelModal={resetReason}
    >
      <h3 slot="title">
        {schedule?.schedule.state.paused
          ? translate('schedules', 'unpause-modal-title')
          : translate('schedules', 'pause-modal-title')}
      </h3>
      <div slot="content">
        <p>
          {schedule?.schedule.state.paused
            ? translate('schedules', 'unpause-modal-confirmation', {
                schedule: scheduleId,
              })
            : translate('schedules', 'pause-modal-confirmation', {
                schedule: scheduleId,
              })}
        </p>
        <p class="my-4">
          {schedule?.schedule.state.paused
            ? translate('schedules', 'unpause-reason')
            : translate('schedules', 'pause-reason')}
        </p>
        <input
          class="block w-full border border-gray-200 rounded-md p-2 mt-4"
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
      <h3 slot="title">{translate('schedules', 'delete-modal-title')}</h3>
      <div slot="content">
        <p>
          {translate('schedules', 'delete-modal-confirmation', {
            schedule: scheduleId,
          })}
        </p>
      </div>
    </Modal>
  {/if}
{:catch error}
  <ScheduleError error={error?.message} />
{/await}

<style lang="postcss">
  .back-to-schedules {
    @apply text-sm;
  }

  .back-to-schedules:hover {
    @apply text-blue-700 underline;
  }
</style>
