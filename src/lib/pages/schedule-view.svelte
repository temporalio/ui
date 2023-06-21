<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    routeForScheduleEdit,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { goto } from '$app/navigation';

  import {
    fetchSchedule,
    deleteSchedule,
    pauseSchedule,
    unpauseSchedule,
  } from '$lib/services/schedule-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';
  import { loading } from '$lib/stores/schedules';

  import ScheduleMemo from '$lib/components/schedule/schedule-memo.svelte';
  import ScheduleRecentRuns from '$lib/components/schedule/schedule-recent-runs.svelte';
  import ScheduleUpcomingRuns from '$lib/components/schedule/schedule-upcoming-runs.svelte';
  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';
  import ScheduleFrequencyPanel from '$lib/components/schedule/schedule-frequency-panel.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import type { DescribeScheduleResponse } from '$types';
  import { coreUserStore } from '$lib/stores/core-user';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  const parameters = {
    namespace,
    scheduleId: decodeURIForSvelte(scheduleId),
  };

  let scheduleFetch = fetchSchedule(parameters);

  let pauseConfirmationModal: Modal;
  let deleteConfirmationModal: Modal;
  let reason = '';

  let coreUser = coreUserStore();
  let editDisabled = $coreUser.namespaceWriteDisabled(namespace);

  const handleDelete = async () => {
    try {
      $loading = true;
      await deleteSchedule({ namespace, scheduleId });
      deleteConfirmationModal?.close();
      setTimeout(() => {
        $loading = false;
        goto(routeForSchedules({ namespace }));
      }, 2000);
    } catch (e) {
      deleteConfirmationModal?.setError(
        `Cannot delete schedule. ${e?.message}`,
      );
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
  };
</script>

{#await scheduleFetch}
  <Loading />
{:then schedule}
  {#if $loading}
    <Loading title="Deleting Schedule..." class="my-2" />
  {:else}
    <header class="flex flex-row justify-between gap-4 mb-8">
      <div class="flex flex-col gap-1 relative">
        <a
          href={routeForSchedules({ namespace })}
          class="absolute top-0 back-to-schedules"
          style="left: -0.5rem;"
        >
          <Icon name="chevron-left" class="inline" />Back to Schedules
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
            Created: {formatDate(schedule?.info?.createTime, $timeFormat)}
          </p>
        </div>
        {#if schedule?.info?.updateTime}
          <div class="flex items-center gap-2 text-sm">
            <p>
              Last updated: {formatDate(
                schedule?.info?.updateTime,
                $timeFormat,
              )}
            </p>
          </div>
        {/if}
      </div>
      <SplitButton
        position="right"
        label={schedule?.schedule?.state?.paused ? 'Unpause' : 'Pause'}
        id="schedule-actions"
        disabled={editDisabled}
        on:click={() => pauseConfirmationModal.open()}
      >
        <MenuItem
          testId="edit-schedule"
          href={routeForScheduleEdit({ namespace, scheduleId })}
        >
          Edit
        </MenuItem>
        <MenuItem
          testId="delete-schedule"
          destructive
          on:click={() => deleteConfirmationModal.open()}
        >
          Delete Schedule
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
      bind:this={pauseConfirmationModal}
      confirmType="primary"
      confirmText={schedule.schedule.state.paused ? 'Unpause' : 'Pause'}
      confirmDisabled={!reason}
      on:confirmModal={() => handlePause(schedule)}
    >
      <h3 slot="title">
        {schedule.schedule.state.paused ? 'Unpause' : 'Pause'} Schedule?
      </h3>
      <div slot="content">
        <p>
          Are you sure you want to {schedule.schedule.state.paused
            ? 'unpause'
            : 'pause'}
          <strong>{scheduleId}</strong>?
        </p>
        <p class="my-4">
          Enter a reason for {schedule.schedule.state.paused
            ? 'unpausing'
            : 'pausing'} the schedule.
        </p>
        <input
          class="block w-full border border-gray-200 rounded-md p-2 mt-4"
          placeholder="Enter a reason"
          bind:value={reason}
          on:keydown|stopPropagation
        />
      </div>
    </Modal>
    <Modal
      id="delete-schedule-modal"
      bind:this={deleteConfirmationModal}
      confirmType="destructive"
      confirmText={'Delete'}
      on:confirmModal={handleDelete}
    >
      <h3 slot="title">Delete Schedule?</h3>
      <div slot="content">
        <p>
          Are you sure you want to delete
          <strong>{scheduleId}</strong>?
        </p>
      </div>
    </Modal>
  {/if}
{/await}

<style lang="postcss">
  .back-to-schedules {
    @apply text-sm;
  }

  .back-to-schedules:hover {
    @apply text-blue-700 underline;
  }
</style>
