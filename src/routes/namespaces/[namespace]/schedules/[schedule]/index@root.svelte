<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import {
    fetchSchedule,
    editSchedule,
    deleteSchedule,
    pauseSchedule,
    unpauseSchedule,
  } from '$lib/services/schedule-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  export const load: Load = async function ({ params }) {
    const { schedule: scheduleId, namespace } = params;

    return {
      props: { namespace, scheduleId },
    };
  };
</script>

<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import { v4 as uuidv4 } from 'uuid';
  import { routeForSchedules } from '$lib/utilities/route-for';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { scheduleForm } from '$lib/stores/schedules';

  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';

  import ScheduleMemo from '$lib/components/schedule/schedule-memo.svelte';
  import ScheduleRecentRuns from '$lib/components/schedule/schedule-recent-runs.svelte';
  import ScheduleUpcomingRuns from '$lib/components/schedule/schedule-upcoming-runs.svelte';
  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';
  import ScheduleFrequencyPanel from '$lib/components/schedule/schedule-frequency-panel.svelte';
  import DropdownButton from '$lib/components/dropdown-button.svelte';
  import Modal from '$lib/components/modal.svelte';
  import ScheduleForm from '$lib/components/schedule/schedule-form.svelte';

  export let namespace: string;
  export let scheduleId: string;

  const parameters = {
    namespace,
    scheduleId: decodeURIForSvelte(scheduleId),
  };

  let scheduleFetch = fetchSchedule(parameters, fetch);

  let showPauseConfirmation = false;
  let showEditConfirmation = false;
  let reason = '';

  onMount(async () => {
    const sched = await scheduleFetch;
    $scheduleForm.schedule_id = scheduleId;
    if (sched.schedule.spec.calendar[0]) {
      $scheduleForm.schedule.spec.calendar = sched.schedule.spec.calendar[0];
    }
    if (sched.schedule.spec.interval[0]) {
      $scheduleForm.schedule.spec.interval = sched.schedule.spec.interval[0];
    }
    $scheduleForm.schedule.action = sched.schedule.action;
  });

  const handleDelete = async () => {
    await deleteSchedule({ namespace, scheduleId });
    goto(routeForSchedules({ namespace }));
  };

  const handlePause = async (schedule) => {
    schedule.schedule.state.paused
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

  const handleEdit = async () => {
    const body = $scheduleForm;
    if (
      body.schedule.spec.interval.interval &&
      body.schedule.spec.interval.phase
    ) {
      body.schedule.spec.interval = [$scheduleForm.schedule.spec.interval];
      body.schedule.spec.calendar = [];
    } else {
      body.schedule.spec.interval = [];
      body.schedule.spec.calendar = [$scheduleForm.schedule.spec.calendar];
    }

    delete body.schedule_id;

    await editSchedule({
      namespace,
      scheduleId,
      request_id: uuidv4(),
      body,
    });
    showEditConfirmation = false;
    scheduleFetch = fetchSchedule(parameters, fetch);
  };

  let options = [
    {
      label: 'Edit',
      value: 'edit',
      onClick: () => (showEditConfirmation = true),
    },
    { label: 'Backfill', value: 'backfill' },
    {
      label: 'Delete',
      value: 'delete',
      onClick: handleDelete,
    },
  ];
</script>

{#await scheduleFetch then schedule}
  <header class="flex flex-row justify-between gap-4 mb-8">
    <main class="flex flex-col gap-1 relative">
      <a
        href={routeForSchedules({ namespace })}
        class="absolute top-2 back-to-workflows"
        style="left: -1.5rem"
      >
        <Icon scale={0.8} name="caretLeft" class="inline" />Back to Schedules
      </a>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl flex relative items-center gap-4">
          <span class="font-medium select-all">{scheduleId}</span>
          <WorkflowStatus
            status={schedule.schedule.state.paused ? 'Paused' : 'Running'}
          />
        </h1>
      </div>
      <div class="flex items-center text-sm">
        <p>
          {namespace}
          {schedule?.schedule?.action?.startWorkflow?.workflowType?.name}
        </p>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <p>Created: {formatDate(schedule?.info?.createTime, $timeFormat)}</p>
        {#if schedule.info.updateTime}
          <p>-</p>
          <p>
            Last updated: {formatDate(schedule?.info?.updateTime, $timeFormat)}
          </p>
        {/if}
      </div>
    </main>
    <DropdownButton
      value={schedule.schedule.state.paused ? 'Unpause' : 'Pause'}
      {options}
      on:click={() => (showPauseConfirmation = !showPauseConfirmation)}
    />
  </header>
  <Modal
    open={showPauseConfirmation}
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
  <div class="flex flex-col gap-4 pb-24">
    {#if schedule?.info?.invalidScheduleError}
      <div class="w-full xl:w-1/2">
        <ScheduleError error={schedule?.info?.invalidScheduleError} />
      </div>
    {/if}
    <div class="w-full xl:w-1/2">
      <ScheduleFrequencyPanel
        calendar={schedule?.schedule?.spec?.calendar?.[0]}
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
        <ScheduleUpcomingRuns futureRuns={schedule?.info?.futureActionTimes} />
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
    open={showEditConfirmation}
    confirmText="Update"
    confirmType="primary"
    large
    on:cancelModal={() => (showEditConfirmation = false)}
    on:confirmModal={handleEdit}
  >
    <h3 slot="title">Edit Schedule</h3>
    <div slot="content">
      <ScheduleForm {namespace} />
    </div>
  </Modal>
{/await}
