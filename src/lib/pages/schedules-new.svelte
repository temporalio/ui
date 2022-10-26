<script lang="ts">
  import { useForm } from 'svelte-use-form';

  import {
    fields,
    submitScheduleForm,
    loading,
    error,
  } from '$lib/stores/schedules';

  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import Icon from '$holocene/icon/icon.svelte';

  import { page } from '$app/stores';
  import { routeForSchedules } from '$lib/utilities/route-for';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$holocene/loading.svelte';
  import FormInput from '$lib/holocene/forms/form-input.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';

  let { namespace } = $page.params;

  let tab = 'calendar';
  let preset = 'daily';

  const form = useForm();

  const handleClick = () => {
    submitScheduleForm($form, namespace);
  };
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
    <form use:form class="mb-4 flex w-full flex-col gap-4 md:w-2/3 xl:w-1/2">
      <div class="w-full">
        <FormInput field={fields.name} />
      </div>
      <div class="w-full">
        <FormInput field={fields.workflowType} />
      </div>
      <div class="w-full">
        <FormInput field={fields.workflowId} />
      </div>
      <div class="w-full">
        <FormInput field={fields.workflowTaskQueue} />
      </div>
      <div class="my-2 flex justify-center">
        <ToggleButtons>
          <ToggleButton
            active={tab === 'calendar'}
            data-cy="calendar"
            on:click={() => (tab = 'calendar')}>Calendar</ToggleButton
          >
          <ToggleButton
            active={tab === 'cronString'}
            data-cy="cronString"
            on:click={() => (tab = 'cronString')}>String</ToggleButton
          >
        </ToggleButtons>
      </div>
      {#if tab === 'calendar'}
        <div class="flex gap-4 w-full justify-center">
          <Button
            active={preset === 'minutes'}
            on:click={() => (preset = 'minutes')}>Minutes</Button
          >
          <Button
            active={preset === 'hourly'}
            on:click={() => (preset = 'hourly')}>Hourly</Button
          >
          <Button
            active={preset === 'daily'}
            on:click={() => (preset = 'daily')}>Daily</Button
          >
          <Button
            active={preset === 'weekly'}
            on:click={() => (preset = 'weekly')}>Weekly</Button
          >
          <Button
            active={preset === 'monthly'}
            on:click={() => (preset = 'monthly')}>Monthly</Button
          >
          <Button
            active={preset === 'yearly'}
            on:click={() => (preset = 'yearly')}>Yearly</Button
          >
          <Button
            active={preset === 'common'}
            on:click={() => (preset = 'common')}>Common</Button
          >
        </div>
        {#if preset === 'minutes'}
          <div class="mb-4 flex gap-4">
            <div class="w-full">
              <FormInput field={fields.interval} />
            </div>
            <div class="w-full">
              <FormInput field={fields.phase} />
            </div>
          </div>
        {:else if preset === 'hourly'}
          <div class="mb-4 flex gap-4">
            <div class="w-full">
              <FormInput field={fields.interval} />
            </div>
            <div class="w-full">
              <FormInput field={fields.phase} />
            </div>
          </div>
        {:else if preset === 'weekly'}
          <DayOfWeekPicker />
        {:else if preset === 'monthly'}
          <DayOfMonthPicker />
        {:else if preset === 'yearly'}
          <MonthPicker />
          <DayOfMonthPicker />
        {/if}
        {#if preset !== 'minutes' && preset !== 'hourly'}
          <div
            class="mb-4 flex items-center justify-center w-full gap-4 bg-gray-100 p-4"
          >
            <div class="w-24">
              <FormInput field={fields.hour} hideLabel />
            </div>
            <div class="w-4">:</div>
            <div class="w-24">
              <FormInput field={fields.minute} hideLabel />
            </div>
            <div class="w-4">:</div>
            <div class="w-24">
              <FormInput field={fields.second} hideLabel />
            </div>
          </div>
        {/if}
      {:else}
        <div class="mb-4 flex flex w-full gap-4">
          <div class="w-full">
            <FormInput field={fields.cronString} />
          </div>
        </div>
      {/if}
      <div class="flex justify-between">
        <Button disabled={!$form.valid} on:click={handleClick}>Create</Button>
        <a
          href={routeForSchedules({ namespace })}
          class="back-to-schedules"
          style="left: 0rem">Cancel</a
        >
      </div>
    </form>
  {/if}
  {#if $error}
    <p
      class="rounded-md border-2 border-orange-500 bg-orange-100 p-5 text-center"
    >
      {$error}
    </p>
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
