<script lang="ts">
  import { useForm } from 'svelte-use-form';

  import { fields } from '$lib/stores/schedules';

  import { page } from '$app/stores';
  import FormInput from '$lib/holocene/forms/form-input.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import Tab from '$lib/holocene/tab.svelte';

  let preset = 'daily';
</script>

<div class="flex flex-wrap gap-6 w-full justify-center mt-8">
  <Tab
    label="Minutes"
    dataCy="minutes-tab"
    active={preset === 'minutes'}
    on:click={() => (preset = 'minutes')}
  />
  <Tab
    label="Hourly"
    dataCy="hourly-tab"
    active={preset === 'hourly'}
    on:click={() => (preset = 'hourly')}
  />
  <Tab
    label="Daily"
    dataCy="daily-tab"
    active={preset === 'daily'}
    on:click={() => (preset = 'daily')}
  />
  <Tab
    label="Weekly"
    dataCy="weekly-tab"
    active={preset === 'weekly'}
    on:click={() => (preset = 'weekly')}
  />
  <Tab
    label="Monthly"
    dataCy="monthly-tab"
    active={preset === 'monthly'}
    on:click={() => (preset = 'monthly')}
  />
  <Tab
    label="Yearly"
    dataCy="yearly-tab"
    active={preset === 'yearly'}
    on:click={() => (preset = 'yearly')}
  />
</div>
{#if preset === 'minutes'}
  <div
    class="mb-4 flex items-center justify-center w-full gap-2 border rounded p-4"
  >
    <div class="flex items-center gap-2">
      <p>Every</p>
      <div class="w-10">
        <FormInput field={fields.minute} hideLabel />
      </div>
      <p class="text-sm">minutes</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-10">
        <FormInput field={fields.second} hideLabel />
      </div>
      <p class="text-sm">seconds</p>
    </div>
  </div>
{:else if preset === 'hourly'}
  <div
    class="mb-4 flex items-center justify-center w-full gap-2 border rounded p-4"
  >
    <div class="flex items-center gap-2">
      <p>Every</p>
      <div class="w-10">
        <FormInput field={fields.hour} hideLabel />
      </div>
      <p class="text-sm">hours</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-10">
        <FormInput field={fields.minute} hideLabel />
      </div>
      <p class="text-sm">minutes</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-10">
        <FormInput field={fields.second} hideLabel />
      </div>
      <p class="text-sm">seconds</p>
    </div>
  </div>
{:else if preset === 'daily'}
  <div
    class="mb-4 flex items-center justify-center w-full gap-2 border rounded p-4"
  >
    <div class="flex items-center gap-2">
      <p>Starting at</p>
      <div class="w-10">
        <FormInput field={fields.hour} hideLabel />
      </div>
    </div>
    <div>:</div>
    <div class="w-10">
      <FormInput field={fields.minute} hideLabel />
    </div>
    <div>:</div>
    <div class="w-10">
      <FormInput field={fields.second} hideLabel />
    </div>
  </div>
{:else if preset === 'weekly'}
  <DayOfWeekPicker />
  <div
    class="mb-4 flex items-center justify-center w-full gap-2 border rounded p-4"
  >
    <div class="flex items-center gap-2">
      <p>Starting at</p>
      <div class="w-10">
        <FormInput field={fields.hour} hideLabel />
      </div>
    </div>
    <div>:</div>
    <div class="w-10">
      <FormInput field={fields.minute} hideLabel />
    </div>
    <div>:</div>
    <div class="w-10">
      <FormInput field={fields.second} hideLabel />
    </div>
  </div>
{:else if preset === 'monthly'}
  <DayOfMonthPicker />
  <div
    class="mb-4 flex items-center justify-center w-full gap-2 border rounded p-4"
  >
    <div class="flex items-center gap-2">
      <p>Starting at</p>
      <div class="w-10">
        <FormInput field={fields.hour} hideLabel />
      </div>
    </div>
    <div>:</div>
    <div class="w-10">
      <FormInput field={fields.minute} hideLabel />
    </div>
    <div>:</div>
    <div class="w-10">
      <FormInput field={fields.second} hideLabel />
    </div>
  </div>
{:else if preset === 'yearly'}
  <MonthPicker />
  <DayOfMonthPicker />
  <div
    class="mb-4 flex items-center justify-center w-full gap-2 border rounded p-4"
  >
    <div class="flex items-center gap-2">
      <p>Starting at</p>
      <div class="w-10">
        <FormInput field={fields.hour} hideLabel />
      </div>
    </div>
    <div>:</div>
    <div class="w-10">
      <FormInput field={fields.minute} hideLabel />
    </div>
    <div>:</div>
    <div class="w-10">
      <FormInput field={fields.second} hideLabel />
    </div>
  </div>
{:else if preset === 'string'}
  <FormInput field={fields.cronString} hideLabel />
{/if}

<style lang="postcss">
</style>
