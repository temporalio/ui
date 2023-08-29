<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/stores';

  import SchedulesCalendarView from '$lib/components/schedule/schedules-calendar-view.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { error, loading } from '$lib/stores/schedules';
  import type {
    FullSchedule,
    ScheduleParameters,
    SchedulePreset,
  } from '$lib/types/schedule';
  import {
    routeForSchedule,
    routeForSchedules,
  } from '$lib/utilities/route-for';

  import type { Schedule } from '$types';

  export let schedule: FullSchedule | null = null;
  export let onConfirm: (
    preset: SchedulePreset,
    args: Partial<ScheduleParameters>,
    schedule?: Schedule,
  ) => void;

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  let title = translate('schedules', schedule ? 'edit' : 'create');
  let loadingText = translate('schedules', schedule ? 'editing' : 'creating');
  let backTitle = translate(
    'schedules',
    schedule ? 'back-to-schedule' : 'back-to-schedules',
  );
  let backHref = schedule
    ? routeForSchedule({ namespace, scheduleId })
    : routeForSchedules({ namespace });
  let confirmText = schedule
    ? translate('save')
    : translate('schedules', 'create');

  let errors = {};
  let name = scheduleId ?? '';
  let workflowType = schedule?.action?.startWorkflow?.workflowType?.name ?? '';
  let workflowId = schedule?.action?.startWorkflow?.workflowId ?? '';
  let taskQueue = schedule?.action?.startWorkflow?.taskQueue?.name ?? '';
  let daysOfWeek: string[] = [];
  let daysOfMonth: number[] = [];
  let months: string[] = [];
  let days = '';
  let hour = '';
  let minute = '';
  let second = '';
  let phase = '';
  let cronString = '';

  const handleConfirm = (preset: SchedulePreset, schedule?: Schedule) => {
    const args: Partial<ScheduleParameters> = {
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

  const onInput = (e: Event) => {
    const { id } = e.target as HTMLInputElement;
    errors[id] = false;

    if ($error) {
      $error = '';
    }
  };

  const onBlur = (e: Event) => {
    const { value, id } = e.target as HTMLInputElement;
    if (!value.trim()) {
      errors[id] = true;
    } else {
      errors[id] = false;
    }
  };

  $: isDisabled = (preset: SchedulePreset) => {
    if (!name || !workflowType || !workflowId || !taskQueue) return true;
    if (preset === 'interval') return !days && !hour && !minute && !second;
    if (preset === 'week') return !daysOfWeek.length;
    if (preset === 'month') return !daysOfMonth.length || !months.length;
    if (preset === 'string') return !cronString;
    return false;
  };

  onDestroy(() => ($error = ''));
</script>

<div class="pb-20">
  {#if $loading}
    <Loading title={loadingText} />
  {:else}
    <header class="relative mb-12 flex gap-1">
      <a href={backHref} class="back absolute top-0" style="left: 0;">
        <Icon name="chevron-left" class="inline" />{backTitle}
      </a>
      <h1 class="font-base mt-8 ml-0 text-2xl">{title}</h1>
    </header>
    <form class="mb-4 flex w-full flex-col gap-4 md:w-2/3 xl:w-1/2">
      <Alert intent="error" title="" hidden={!$error} bold>
        {$error}
      </Alert>
      <div class="w-full">
        <Input
          id="name"
          bind:value={name}
          label={translate('schedules', 'name-label')}
          error={errors['name']}
          maxLength={232}
          disabled={Boolean(scheduleId)}
          on:input={onInput}
          on:blur={onBlur}
        />
      </div>
      <div class="w-full">
        <Input
          id="workflowType"
          bind:value={workflowType}
          label={translate('schedules', 'workflow-type-label')}
          error={errors['workflowType']}
          on:input={onInput}
          on:blur={onBlur}
        />
      </div>
      <div class="w-full">
        <Input
          id="workflowId"
          bind:value={workflowId}
          label={translate('schedules', 'workflow-id-label')}
          error={errors['workflowId']}
          on:input={onInput}
          on:blur={onBlur}
        />
      </div>
      <div class="w-full">
        <Input
          id="taskQueue"
          bind:value={taskQueue}
          label={translate('schedules', 'task-queue-label')}
          error={errors['taskQueue']}
          on:input={onInput}
          on:blur={onBlur}
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
          <a href={backHref} class="back" style="left: 0;"
            >{translate('cancel')}</a
          >
        </div>
      </SchedulesCalendarView>
    </form>
  {/if}
</div>

<style lang="postcss">
  .back {
    @apply text-sm;
  }

  .back:hover {
    @apply text-blue-700 underline;
  }
</style>
