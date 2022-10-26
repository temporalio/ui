<script lang="ts">
  import { useForm } from 'svelte-use-form';

  import {
    fields,
    submitScheduleForm,
    loading,
    error,
  } from '$lib/stores/schedules';

  import Icon from '$holocene/icon/icon.svelte';

  import { page } from '$app/stores';
  import { routeForSchedules } from '$lib/utilities/route-for';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$holocene/loading.svelte';
  import FormInput from '$lib/holocene/forms/form-input.svelte';
  import { noop } from 'svelte/internal';
  import SchedulesCalendarView from '$lib/components/schedule/schedules-calendar-view.svelte';
  import Tab from '$lib/holocene/tab.svelte';

  let { namespace } = $page.params;

  let preset = 'daily';
  let calendars = [];

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
          on:click={() => (preset = 'monthyl')}
        />
        <Tab
          label="Yearly"
          dataCy="yearly-tab"
          active={preset === 'yearly'}
          on:click={() => (preset = 'yearly')}
        />
      </div>
      <SchedulesCalendarView {preset} />
      <div class="flex justify-center">
        <Button
          variant="secondary"
          on:click={noop}
          disabled={preset === 'string'}>+</Button
        >
      </div>
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
