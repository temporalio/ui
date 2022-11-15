<script lang="ts">
  import { loading, error } from '$lib/stores/schedules';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$holocene/loading.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import SchedulesCalendarView from '$lib/components/schedule/schedules-calendar-view.svelte';
  import type { Schedule } from '$types';
  import { page } from '$app/stores';

  export let schedule: FullScheduleSpec | null = null;
  export let title: string;
  export let loadingText: string;
  export let backTitle: string;
  export let backHref: string;
  export let confirmText: string;
  export let onConfirm: (
    preset: SchedulePreset,
    args: ScheduleParameters,
    schedule?: Schedule,
  ) => void;

  let scheduleId = $page.params.schedule;

  let errors = {};
  let name = scheduleId ?? '';
  let workflowType = schedule
    ? schedule?.action?.startWorkflow?.workflowType?.name
    : '';
  let workflowId = schedule ? schedule?.action?.startWorkflow?.workflowId : '';
  let taskQueue = schedule
    ? schedule?.action?.startWorkflow?.taskQueue?.name
    : '';
  let daysOfWeek: string[] = [];
  let daysOfMonth: number[] = [];
  let months: string[] = [];
  let days = '';
  let hour = '';
  let minute = '';
  let second = '';
  let phase = '';
  let cronString = '';

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

  const handleConfirm = (preset: SchedulePreset, schedule?: Schedule) => {
    const args: ScheduleParameters = {
      name,
      workflowType,
      workflowId,
      taskQueue,
      hour,
      minute,
      second,
      phase,
      cronString,
      daysOfWeek,
      daysOfMonth,
      days,
      months,
    };

    onConfirm(preset, args, schedule);
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
  {#if $loading}
    <Loading title={loadingText} />
  {:else}
    <main class="relative mb-12 flex gap-1">
      <a href={backHref} class="back absolute top-0" style="left: 0rem">
        <Icon name="chevron-left" class="inline" />{backTitle}
      </a>
      <h2 class="font-base mt-8 ml-0 text-2xl">{title}</h2>
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
          id="name"
          bind:value={name}
          label="Name"
          maxLength={232}
          disabled={Boolean(scheduleId)}
        />
      </div>
      <div class="w-full">
        <Input
          id="workflowType"
          bind:value={workflowType}
          label="Workflow Type*"
          error={errors['workflowType']}
          on:input={() => onInput('workflowType')}
          on:blur={() => onBlur('workflowType', workflowType)}
        />
      </div>
      <div class="w-full">
        <Input
          id="workflowId"
          bind:value={workflowId}
          label="Workflow Id*"
          error={errors['workflowId']}
          on:input={() => onInput('workflowId')}
          on:blur={() => onBlur('workflowId', workflowId)}
        />
      </div>
      <div class="w-full">
        <Input
          id="taskQueue"
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
        <div class="mt-8 flex items-center gap-8">
          <Button
            disabled={isDisabled(preset)}
            on:click={() => handleConfirm(preset, schedule)}
            >{confirmText}</Button
          >
          <a href={backHref} class="back" style="left: 0rem">Cancel</a>
        </div>
      </SchedulesCalendarView>
    </form>
  {/if}
</article>

<style lang="postcss">
  .back {
    @apply text-sm;
  }

  .back:hover {
    @apply text-blue-700 underline;
  }
</style>
