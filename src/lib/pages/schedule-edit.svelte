<script lang="ts">
  import { submitScheduleForm, loading, error } from '$lib/stores/schedules';

  import Icon from '$holocene/icon/icon.svelte';

  import { page } from '$app/stores';
  import { routeForSchedule } from '$lib/utilities/route-for';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$holocene/loading.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { onMount } from 'svelte';
  import { fetchSchedule } from '$lib/services/schedule-service';
  import { convertStructuredCalendar } from '$lib/utilities/schedule-data-formatting';

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  let errors = {};
  let name = '';
  let workflowType = '';
  let workflowId = '';
  let taskQueue = '';

  onMount(async () => {
    const parameters = {
      namespace,
      scheduleId: decodeURIForSvelte(scheduleId),
    };
    let { schedule } = await fetchSchedule(parameters);
    name = scheduleId;
    workflowType = schedule.action.startWorkflow.workflowType.name;
    workflowId = schedule.action.startWorkflow.workflowId;
    taskQueue = schedule.action.startWorkflow.taskQueue.name;
    // console.log(
    //   'Structured Calendar spec: ',
    //   schedule.spec.structuredCalendar[0],
    // );

    // const calendarSpec = convertStructuredCalendar(
    //   schedule.spec.structuredCalendar[0],
    // );
    // console.log('Calendar spec: ', calendarSpec);
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

  const handleClick = () => {
    // submitEditScheduleForm({
    //   namespace,
    //   name,
    //   workflowType,
    //   workflowId,
    //   taskQueue,
    // });
  };

  $: disabled = !name || !workflowType || !workflowId || !taskQueue;
</script>

<article class="pb-20">
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
          id="name"
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
      <div class="mt-8 flex justify-between">
        <Button {disabled} on:click={() => handleClick()}>Edit Schedule</Button>

        <a
          href={routeForSchedule({ namespace, scheduleId })}
          class="back-to-schedule"
          style="left: 0rem">Cancel</a
        >
      </div>
    </form>
  {/if}
</article>

<style lang="postcss">
  .back-to-schedule {
    @apply text-sm;
  }

  .back-to-schedule:hover {
    @apply text-blue-700 underline;
  }
</style>
