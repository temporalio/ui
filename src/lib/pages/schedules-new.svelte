<script lang="ts">
  import { submitScheduleForm, loading, error } from '$lib/stores/schedules';

  import Icon from '$holocene/icon/icon.svelte';

  import { page } from '$app/stores';
  import { routeForSchedules } from '$lib/utilities/route-for';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$holocene/loading.svelte';
  import SchedulesCalendarView from '$lib/components/schedule/schedules-calendar-view.svelte';
  import Input from '$lib/holocene/input/input.svelte';

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

  let { namespace } = $page.params;

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

  const handleClick = (preset: SchedulePreset) => {
    submitScheduleForm({
      namespace,
      preset,
      name,
      workflowType,
      workflowId,
      taskQueue,
      daysOfWeek,
      daysOfMonth,
      months,
      days,
      hour,
      minute,
      second,
      phase,
      cronString,
    });
  };

  $: disabled = !name || !workflowType || !workflowId || !taskQueue;
</script>

<article class="pb-20">
  {#if $loading}
    <Loading title="Creating Schedule..." />
  {:else}
    <main class="relative mb-12 flex gap-1">
      <a
        href={routeForSchedules({ namespace })}
        class="back-to-schedules absolute top-0"
        style="left: 0rem"
      >
        <Icon name="chevron-left" class="inline" />Back to Schedules
      </a>
      <h2 class="font-base mt-8 ml-0 text-2xl">Create Schedule</h2>
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
          label="Name*"
          maxLength={232}
          error={errors['name']}
          on:input={() => onInput('name')}
          on:blur={() => onBlur('name', name)}
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
        <div class="mt-8 flex justify-between">
          <Button {disabled} on:click={() => handleClick(preset)}
            >Create Schedule</Button
          >

          <a
            href={routeForSchedules({ namespace })}
            class="back-to-schedules"
            style="left: 0rem">Cancel</a
          >
        </div>
      </SchedulesCalendarView>
    </form>
  {/if}
</article>

<style lang="postcss">
  .back-to-schedules {
    @apply text-sm;
  }

  .back-to-schedules:hover {
    @apply text-blue-700 underline;
  }
</style>
