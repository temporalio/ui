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
  import Icon from '$holocene/icon/index.svelte';

  import { page } from '$app/stores';
  import { routeForSchedules } from '$lib/utilities/route-for';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$holocene/loading.svelte';
  import FormInput from '$lib/holocene/forms/form-input.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';

  let { namespace } = $page.params;

  let tab = 'interval';
  let interval = 'daily';

  const form = useForm();

  const handleClick = () => {
    submitScheduleForm($form, namespace);
  };
</script>

<PageTitle title={`Create Schedule | ${namespace}`} url={$page.url.href} />
<article class="pb-20">
  {#if $loading}
    <Loading title="Creating Schedule..." />
  {:else}
    <main class="relative mb-12 flex gap-1">
      <div class="back-to-schedules">
        <a
          href={routeForSchedules({ namespace })}
          class="back-to-schedules absolute top-0"
          style="left: 0rem"
        >
          <Icon scale={0.8} name="caretLeft" class="inline" />Back to Schedules
        </a>
      </div>
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
            icon="workflow"
            active={tab === 'interval'}
            data-cy="interval"
            on:click={() => (tab = 'interval')}>Interval</ToggleButton
          >
          <ToggleButton
            icon="calendarPlus"
            active={tab === 'calendar'}
            data-cy="calendar"
            on:click={() => (tab = 'calendar')}>Calendar</ToggleButton
          >
        </ToggleButtons>
      </div>
      {#if tab === 'interval'}
        <div class="my-2 flex justify-center">
          <ToggleButtons>
            <ToggleButton
              active={interval === 'hourly'}
              data-cy="interval-hourly"
              on:click={() => (interval = 'hourly')}>Hourly</ToggleButton
            >
            <ToggleButton
              active={interval === 'daily'}
              data-cy="interval-daily"
              on:click={() => (interval = 'daily')}>Daily</ToggleButton
            >
            <ToggleButton
              active={interval === 'weekly'}
              data-cy="interval-weekly"
              on:click={() => (interval = 'weekly')}>Weekly</ToggleButton
            >
            <ToggleButton
              active={interval === 'monthly'}
              data-cy="interval-monthly"
              on:click={() => (interval = 'monthly')}>Monthly</ToggleButton
            >
            <ToggleButton
              active={interval === 'yearly'}
              data-cy="interval-yearly"
              on:click={() => (interval = 'yearly')}>Yearly</ToggleButton
            >
            <ToggleButton
              active={interval === 'custom'}
              data-cy="interval-custom"
              on:click={() => (interval = 'custom')}>Custom</ToggleButton
            >
          </ToggleButtons>
        </div>
        <input
          type="time"
          id="shorthand"
          name="shorthand"
          min="00:00"
          max="24:00"
        />

        {#if interval === 'custom'}
          <div class="mb-4 flex gap-4">
            <div class="w-full">
              <FormInput field={fields.interval} />
            </div>
            <div class="w-full">
              <FormInput field={fields.phase} />
            </div>
          </div>
        {/if}
      {:else}
        <div class="mb-4 flex flex gap-4">
          <div class="w-1/4">
            <FormInput field={fields.year} />
          </div>
          <div class="w-1/4">
            <FormInput field={fields.month} />
          </div>
          <div class="w-1/4">
            <FormInput field={fields.dayOfMonth} />
          </div>
          <div class="w-1/4">
            <FormInput field={fields.dayOfWeek} />
          </div>
        </div>
        <div class="mb-4 flex flex w-full gap-4">
          <div class="w-1/3">
            <FormInput field={fields.hour} />
          </div>
          <div class="w-1/3">
            <FormInput field={fields.minute} />
          </div>
          <div class="w-1/3">
            <FormInput field={fields.second} />
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

  .back-to-schedules:hover :global(svg path) {
    stroke: #1d4ed8;
  }
</style>
