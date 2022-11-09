<script lang="ts">
  import { page } from '$app/stores';

  import { submitEditSchedule, loading, error } from '$lib/stores/schedules';
  import { routeForSchedule } from '$lib/utilities/route-for';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$holocene/loading.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { fetchSchedule } from '$lib/services/schedule-service';
  import SchedulesCalendarView from '$lib/components/schedule/schedules-calendar-view.svelte';
  import type { Schedule } from '$types';

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  let errors = {};
  let name = '';
  let workflowType = '';
  let workflowId = '';
  let taskQueue = '';
  let daysOfWeek: string[] = [];
  let daysOfMonth: number[] = [];
  let months: string[] = [];
  let days = '';
  let hour = '';
  let minute = '';
  let second = '';
  let phase = '';
  let cronString = '';

  let scheduleFetch = fetchSchedule({ namespace, scheduleId }).then((data) => {
    const { schedule } = data;
    name = scheduleId;
    workflowType = schedule.action.startWorkflow.workflowType.name;
    workflowId = schedule.action.startWorkflow.workflowId;
    taskQueue = schedule.action.startWorkflow.taskQueue.name;
    return schedule;
  });

  const onInput = (key: string) => {
    errors[key] = false;
  };

  const onBlur = (key: string, value: string) => {
    if (!value) {
      errors[key] = true;
    } else {
      errors[key] = false;
    }
  };

  const handleClick = (preset: SchedulePreset, schedule: Schedule) => {
    const action: ScheduleActionParameters = {
      namespace,
      name,
      workflowType,
      workflowId,
      taskQueue,
    };
    const spec: Partial<ScheduleSpecParameters> = {
      hour,
      minute,
      second,
      phase,
      cronString,
    };
    const presets: SchedulePresetsParameters = {
      preset,
      daysOfWeek,
      daysOfMonth,
      months,
      days,
    };
    submitEditSchedule({ action, spec, presets }, schedule, scheduleId);
  };

  $: isDisabled = (preset: SchedulePreset) => {
    if (!name || !workflowType || !workflowId || !taskQueue) return true;
    if (preset === 'interval') return !days && !hour && !minute && !second;
    if (preset === 'week') return !daysOfWeek.length;
    if (preset === 'month') return !daysOfMonth.length || !months.length;
    if (preset === 'string') return !cronString;
    return false;
  };
</script>

<article class="pb-20">
  {#await scheduleFetch}
    <Loading title="Loading Schedule..." />
  {:then schedule}
    {#if $loading}
      <Loading title="Editing Schedule..." />
    {:else}
      <main class="relative mb-12 flex gap-1">
        <a
          href={routeForSchedule({ namespace, scheduleId })}
          class="back-to-schedule absolute top-0"
          style="left: 0rem"
        >
          <Icon name="chevron-left" class="inline" />Back to Schedule
        </a>
        <h2 class="font-base mt-8 ml-0 text-2xl">Edit Schedule</h2>
      </main>
      <form class="mb-4 flex w-full flex-col gap-4 md:w-2/3 xl:w-1/2">
        {#if $error}
          <p
            class="rounded-md border-2 border-orange-500 bg-orange-100 p-5 text-center"
          >
            {$error}
          </p>
        {/if}
        <div class="w-full">
          <Input
            id="hour"
            bind:value={name}
            label="Name"
            maxLength={232}
            disabled
          />
        </div>
        <div class="w-full">
          <Input
            id="hour"
            bind:value={workflowType}
            label="Workflow Type*"
            error={errors['workflowType']}
            on:input={() => onInput('workflowType')}
            on:blur={() => onBlur('workflowType', workflowType)}
          />
        </div>
        <div class="w-full">
          <Input
            id="hour"
            bind:value={workflowId}
            label="Workflow Id*"
            error={errors['workflowId']}
            on:input={() => onInput('workflowId')}
            on:blur={() => onBlur('workflowId', workflowId)}
          />
        </div>
        <div class="w-full">
          <Input
            id="hour"
            bind:value={taskQueue}
            label="Task Queue*"
            error={errors['taskQueue']}
            on:input={() => onInput('taskQueue')}
            on:blur={() => onBlur('taskQueue', taskQueue)}
          />
        </div>
        <SchedulesCalendarView
          let:preset
          {schedule}
          bind:daysOfWeek
          bind:daysOfMonth
          bind:months
          bind:days
          bind:hour
          bind:minute
          bind:second
          bind:phase
          bind:cronString
        >
          <div class="mt-8 flex gap-8 items-center">
            <Button
              disabled={isDisabled(preset)}
              on:click={() => handleClick(preset, schedule)}>Save</Button
            >

            <a
              href={routeForSchedule({ namespace, scheduleId })}
              class="back-to-schedule"
              style="left: 0rem">Cancel</a
            >
          </div>
        </SchedulesCalendarView>
      </form>
    {/if}
  {/await}
</article>

<style lang="postcss">
  .back-to-schedule {
    @apply text-sm;
  }

  .back-to-schedule:hover {
    @apply text-blue-700 underline;
  }
</style>
