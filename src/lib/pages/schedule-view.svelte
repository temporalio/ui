<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$holocene/icon/icon.svelte';
  import { routeForSchedules } from '$lib/utilities/route-for';
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
  import Modal from '$holocene/modal.svelte';
  import SplitButton from '$holocene/split-button.svelte';
  import Loading from '$holocene/loading.svelte';
  import type { DescribeScheduleResponse } from '$types';

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  const parameters = {
    namespace,
    scheduleId: decodeURIForSvelte(scheduleId),
  };

  let scheduleFetch = fetchSchedule(parameters, fetch);

  let showPauseConfirmation = false;
  let showDeleteConfirmation = false;

  let reason = '';

  const handleDelete = async () => {
    try {
      $loading = true;
      await deleteSchedule({ namespace, scheduleId });
      setTimeout(() => {
        goto(routeForSchedules({ namespace }));
        $loading = false;
      }, 2000);
    } catch (e) {
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
    showPauseConfirmation = false;
    reason = '';
  };

  let options = [
    {
      label: 'Delete Schedule',
      onClick: () => (showDeleteConfirmation = true),
      class: 'text-red-500',
    },
  ];
</script>

{#await scheduleFetch}
  <Loading />
{:then schedule}
  {#if $loading}
    <Loading title="Deleting Schedule..." class="my-2" />
  {:else}
    <header class="flex flex-row justify-between gap-4 mb-8">
      <main class="flex flex-col gap-1 relative">
        <a
          href={routeForSchedules({ namespace })}
          class="absolute top-0 back-to-schedules"
          style="left: -.5rem"
        >
          <Icon name="chevron-left" class="inline" />Back to Schedules
        </a>
        <div class="flex justify-between items-center mt-8">
          <h1 class="text-2xl flex relative items-center gap-4">
            <WorkflowStatus
              status={schedule?.schedule.state.paused ? 'Paused' : 'Running'}
            />
            <span class="font-medium select-all">{scheduleId}</span>
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
          <p>Created: {formatDate(schedule?.info?.createTime, $timeFormat)}</p>
          {#if schedule?.info?.updateTime}
            <p>-</p>
            <p>
              Last updated: {formatDate(
                schedule?.info?.updateTime,
                $timeFormat,
              )}
            </p>
          {/if}
        </div>
      </main>
      <SplitButton
        position="right"
        label={schedule?.schedule?.state?.paused ? 'Unpause' : 'Pause'}
        id="pause-schedule-button"
        on:click={() => (showPauseConfirmation = !showPauseConfirmation)}
      >
        {#each options as option}
          <div
            class="cursor-pointer flex gap-2 p-4 items-center {option?.class}"
            on:click={option.onClick}
          >
            {option.label}
          </div>
        {/each}
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
        <div class="w-full xl:w-1/4">
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
      open={showPauseConfirmation}
      confirmType="primary"
      confirmText={schedule.schedule.state.paused ? 'Unpause' : 'Pause'}
      confirmDisabled={!reason}
      on:cancelModal={() => (showPauseConfirmation = false)}
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
        />
      </div>
    </Modal>
    <Modal
      open={showDeleteConfirmation}
      confirmType="destructive"
      confirmText={'Delete'}
      on:cancelModal={() => (showDeleteConfirmation = false)}
      on:confirmModal={() => handleDelete()}
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
