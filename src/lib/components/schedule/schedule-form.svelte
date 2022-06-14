<script lang="ts">
  import { scheduleForm } from '$lib/stores/schedules';
  import ToggleButton from '../toggle-button.svelte';
  import ToggleButtons from '../toggle-buttons.svelte';

  export let namespace: string;

  let tab = 'calendar';
  console.log('FORM: ', $scheduleForm);
</script>

<div class="mb-4 flex gap-4">
  <div class="w-full">
    <p class="">Schedule Name</p>
    <input
      class="block w-full rounded-md border border-gray-200 p-2"
      placeholder="Name"
      bind:value={$scheduleForm.schedule_id}
    />
  </div>
</div>

<ToggleButtons>
  <ToggleButton
    active={tab === 'calendar'}
    data-cy="calendar"
    on:click={() => (tab = 'calendar')}>Calendar</ToggleButton
  >
  <ToggleButton
    active={tab === 'interval'}
    data-cy="interval"
    on:click={() => (tab = 'interval')}>Interval</ToggleButton
  >
</ToggleButtons>
<hr class="mt-4 mb-8" />
{#if tab === 'interval'}
  <div class="mb-4 flex gap-4">
    <div class="w-1/2">
      <p class="">Interval</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Interval"
        bind:value={$scheduleForm.schedule.spec.interval.interval}
      />
    </div>
    <div class="w-1/2">
      <p class="">Phase</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Phase"
        bind:value={$scheduleForm.schedule.spec.interval.phase}
      />
    </div>
  </div>
{:else}
  <div class="mb-4 flex gap-4">
    <div class="w-1/4">
      <p class="">Year</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Year"
        bind:value={$scheduleForm.schedule.spec.calendar.year}
      />
    </div>
    <div class="w-1/4">
      <p class="">Month</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Hour"
        bind:value={$scheduleForm.schedule.spec.calendar.month}
      />
    </div>
    <div class="w-1/4">
      <p class="">Day of Month</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Day"
        bind:value={$scheduleForm.schedule.spec.calendar.dayOfMonth}
      />
    </div>
    <div class="w-1/4">
      <p class="">Day of Week</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Day of Week"
        bind:value={$scheduleForm.schedule.spec.calendar.dayOfWeek}
      />
    </div>
  </div>

  <div class="mb-4 flex gap-4">
    <div class="w-1/3">
      <p class="">Hour</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Hour"
        bind:value={$scheduleForm.schedule.spec.calendar.hour}
      />
    </div>
    <div class="w-1/3">
      <p class="">Minute</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Hour"
        bind:value={$scheduleForm.schedule.spec.calendar.minute}
      />
    </div>
    <div class="w-1/3">
      <p class="">Second</p>
      <input
        class="block w-full rounded-md border border-gray-200 p-2"
        placeholder="Hour"
        bind:value={$scheduleForm.schedule.spec.calendar.second}
      />
    </div>
  </div>
{/if}
<hr class="my-8" />
<div class="mb-4 flex gap-4">
  <div class="w-1/2">
    <p class="">Workflow ID</p>
    <input
      class="block w-full rounded-md border border-gray-200 p-2"
      placeholder="Workflow ID"
      bind:value={$scheduleForm.schedule.action.startWorkflow.workflowId}
    />
  </div>
  <div class="w-1/2">
    <p class="">Workflow Type</p>
    <input
      class="block w-full rounded-md border border-gray-200 p-2"
      placeholder="Workflow Type"
      bind:value={$scheduleForm.schedule.action.startWorkflow.workflowType.name}
    />
  </div>
</div>
<div class="mb-4 flex gap-4">
  <div class="w-1/2">
    <p class="">Task Queue</p>
    <input
      class="block w-full rounded-md border border-gray-200 p-2"
      placeholder="Task Queue"
      bind:value={$scheduleForm.schedule.action.startWorkflow.taskQueue.name}
    />
  </div>
</div>

<style lang="postcss">
</style>
