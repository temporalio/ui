<script lang="ts">
  import { scheduleForm } from '$lib/stores/schedules';
  import ToggleButton from '../toggle-button.svelte';
  import ToggleButtons from '../toggle-buttons.svelte';

  let tab = 'interval';
</script>

<div class="mb-4 flex gap-4">
  <div class="w-full">
    <label for="name">Schedule Name</label>
    <input
      type="name"
      class="block w-full rounded-md border border-gray-200 p-2"
      bind:value={$scheduleForm.schedule_id}
    />
  </div>
  <div class="w-full">
    <label for="workflow-type">Workflow Type</label>
    <input
      type="workflow-type"
      class="block w-full rounded-md border border-gray-200 p-2"
      bind:value={$scheduleForm.schedule.action.startWorkflow.workflowType.name}
    />
  </div>
</div>
<div class="mb-4 flex gap-4">
  <div class="w-full">
    <label for="workflow-id">Workflow Id</label>
    <input
      type="workflow-id"
      class="block w-full rounded-md border border-gray-200 p-2"
      bind:value={$scheduleForm.schedule.action.startWorkflow.workflowId}
    />
  </div>
  <div class="w-full">
    <label for="task-queue">Task Queue</label>
    <input
      type="task-queue"
      class="block w-full rounded-md border border-gray-200 p-2"
      bind:value={$scheduleForm.schedule.action.startWorkflow.taskQueue.name}
    />
  </div>
</div>

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
<hr class="mt-4 mb-8" />
{#if tab === 'interval'}
  <div class="mb-4 flex gap-4">
    <div class="w-1/2">
      <label for="interval">Interval</label>
      <input
        type="interval"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.interval.interval}
      />
    </div>
    <div class="w-1/2">
      <label for="phase">Phase</label>
      <input
        type="phase"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.interval.phase}
      />
    </div>
  </div>
{:else}
  <div class="mb-4 flex gap-4">
    <div class="w-1/2">
      <label for="year">Year</label>
      <input
        type="year"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.calendar.year}
      />
      <label for="for-month">Month</label>
      <input
        type="for-month"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.calendar.month}
      />
      <label for="day-of-month">Day of Month</label>
      <input
        type="day-of-month"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.calendar.dayOfMonth}
      />
      <label for="day-of-week">Day of Week</label>
      <input
        type="day-of-week"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.calendar.dayOfWeek}
      />
    </div>
    <div class="w-1/2">
      <label for="hour">Hour</label>
      <input
        type="hour"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.calendar.hour}
      />
      <label for="minute">Minute</label>
      <input
        type="minute"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.calendar.minute}
      />
      <label for="second">Second</label>
      <input
        type="second"
        class="block w-full rounded-md border border-gray-200 p-2"
        bind:value={$scheduleForm.schedule.spec.calendar.second}
      />
    </div>
  </div>
{/if}

<style lang="postcss">
  label {
    @apply text-sm text-gray-700;
  }
</style>
