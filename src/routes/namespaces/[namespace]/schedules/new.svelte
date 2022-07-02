<script lang="ts">
  import { initialForm, scheduleForm } from '$lib/stores/schedules';
  import { createSchedule } from '$lib/services/schedule-service';

  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import PageTransition from '$lib/holocene/page-transition.svelte';
  import Icon from '$holocene/icon/index.svelte';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { routeForSchedules } from '$lib/utilities/route-for';
  import Link from '$lib/components/link.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$lib/components/loading.svelte';

  let tab = 'interval';
  let loading = false;

  let { namespace } = $page.params;

  const handleClick = async () => {
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

    // Need to wait x amount for create to get it on fetchAllSchedules
    try {
      loading = true;
      await createSchedule({
        namespace,
        body,
      });
      setTimeout(() => {
        goto(routeForSchedules({ namespace }));
        loading = false;
      }, 1000);
      $scheduleForm = initialForm;
    } catch (e) {
      loading = false;
    }
  };
</script>

{#if loading}
  <Loading title="Creating Schedule..." />
{:else}
  <main class="relative mb-12 flex gap-1">
    <div class="back-to-schedules">
      <a
        href={routeForSchedules({ namespace })}
        class="back-to-workflows absolute top-0"
        style="left: -1.5rem"
      >
        <Icon scale={0.8} name="caretLeft" class="inline" />Back to Schedules
      </a>
    </div>
    <h2 class="font-base mt-12 ml-0 text-2xl">Create Schedule</h2>
  </main>
  <article class="mb-4 flex w-full flex-col gap-4 md:w-2/3 xl:w-1/2">
    <div class="w-full">
      <label for="name">Schedule Name</label>
      <input type="name" class="input" bind:value={$scheduleForm.schedule_id} />
    </div>
    <div class="w-full">
      <label for="workflow-type">Workflow Type</label>
      <input
        type="workflow-type"
        class="input"
        bind:value={$scheduleForm.schedule.action.startWorkflow.workflowType
          .name}
      />
    </div>
    <div class="w-full">
      <label for="workflow-id">Workflow Id</label>
      <input
        type="workflow-id"
        class="input"
        bind:value={$scheduleForm.schedule.action.startWorkflow.workflowId}
      />
    </div>
    <div class="w-full">
      <label for="task-queue">Task Queue</label>
      <input
        type="task-queue"
        class="input"
        bind:value={$scheduleForm.schedule.action.startWorkflow.taskQueue.name}
      />
    </div>
    <div class="my-2 flex justify-center">
      <ToggleButtons>
        <ToggleButton
          icon="workflow"
          active={tab === 'interval'}
          data-cy="interval"
          on:click={() => (tab = 'interval')}>Interval</ToggleButton
        >
        <ToggleButton
          icon="calendar"
          active={tab === 'calendar'}
          data-cy="calendar"
          on:click={() => (tab = 'calendar')}>Calendar</ToggleButton
        >
      </ToggleButtons>
    </div>
    {#if tab === 'interval'}
      <div class="mb-4 flex gap-4">
        <div class="w-full">
          <label for="interval">Interval</label>
          <input
            type="interval"
            class="input"
            bind:value={$scheduleForm.schedule.spec.interval.interval}
          />
        </div>
        <div class="w-full">
          <label for="phase">Phase</label>
          <input
            type="phase"
            class="input"
            bind:value={$scheduleForm.schedule.spec.interval.phase}
          />
        </div>
      </div>
    {:else}
      <div class="mb-4 flex flex gap-4">
        <div class="w-1/5">
          <label for="year">Year</label>
          <input
            type="year"
            class="input"
            bind:value={$scheduleForm.schedule.spec.calendar.year}
          />
        </div>
        <div class="w-1/5">
          <label for="for-month">Month</label>
          <input
            type="for-month"
            class="input"
            bind:value={$scheduleForm.schedule.spec.calendar.month}
          />
        </div>
        <div class="w-1/5">
          <label for="hour">Hour</label>
          <input
            type="hour"
            class="input"
            bind:value={$scheduleForm.schedule.spec.calendar.hour}
          />
        </div>
        <div class="w-1/5">
          <label for="minute">Minute</label>
          <input
            type="minute"
            class="input"
            bind:value={$scheduleForm.schedule.spec.calendar.minute}
          />
        </div>
        <div class="w-1/5">
          <label for="second">Second</label>
          <input
            type="second"
            class="input"
            bind:value={$scheduleForm.schedule.spec.calendar.second}
          />
        </div>
      </div>
      <div class="mb-4 flex flex w-full gap-4 md:w-2/3 xl:w-1/2">
        <div class="w-1/2">
          <label for="day-of-month">Day of Month</label>
          <input
            type="day-of-month"
            class="input"
            bind:value={$scheduleForm.schedule.spec.calendar.dayOfMonth}
          />
        </div>
        <div class="w-1/2">
          <label for="day-of-week">Day of Week</label>
          <input
            type="day-of-week"
            class="input"
            bind:value={$scheduleForm.schedule.spec.calendar.dayOfWeek}
          />
        </div>
      </div>
    {/if}
    <div class="flex justify-end">
      <Button on:click={handleClick}>Create</Button>
    </div>
  </article>
{/if}

<style lang="postcss">
  input {
    @apply block w-full rounded-md border border-gray-400 p-2;
  }
  label {
    @apply text-sm text-gray-700;
  }

  .back-to-schedules {
    @apply text-sm;
  }

  .back-to-schedules:hover {
    @apply text-blue-700 underline;
  }

  .back-to-schedules:hover :global(svg path) {
    stroke: #1d4ed8;
  }
</style>
